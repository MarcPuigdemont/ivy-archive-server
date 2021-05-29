const fetch = require('node-fetch')

const { STEAM_KEY } = require('../.keys.json')
const { login, CLIENT_ID } = require('../utils/igdb')
const { userUtils } = require('../utils/user')
const { couch, dbName, usersUrl, gamesUrl } = require('../utils/database')
const { verifyToken } = require('../utils/jwt')

const userDB = userUtils(couch, dbName, usersUrl)

let igdbToken = ''
login().then((token) => { igdbToken = token })

const getIGDBGameIds = (steamGames) => {
  const steamCategory = 13
  const gameIds = steamGames.map((game) => game.appid)

  const fields = 'fields game,trusted,url;'
  const condition = `where category=${steamCategory}`
  const urls = gameIds.map(
    (id) => `url = 'https://store.steampowered.com/app/${id}' | url ~ 'https://store.steampowered.com/app/${id}/'*`,
  )

  return fetch('https://api.igdb.com/v4/websites', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Client-ID': CLIENT_ID,
      Authorization: `Bearer ${igdbToken.access_token}`,
    },
    body: `${fields}${condition} & (${urls.join(' | ')});`,
  })
    .then((res) => res.json())
    .then((websites) => {
      const games = websites.map((w) => {
        const lastSlashPos = w.url.slice(35).indexOf('/')
        const appid = parseInt(lastSlashPos === -1 ? w.url.slice(35) : w.url.slice(35, 35 + lastSlashPos), 10)
        return { id: w.game, appid }
      })
      const missing = steamGames.filter((game) => !games.map((g) => g.appid).includes(game.appid))

      return {
        games,
        missing,
      }
    })
    .catch((err) => {
      console.error(err)
    })
}

const saveGamesToDB = async (email, games) => {
  try {
    const { data } = await couch.get(dbName, `${gamesUrl}/by-email?key="${email}"`)
    if (data.rows.length === 0) {
      const newId = (await couch.uniqid())[0]
      await couch.insert(dbName, {
        _id: newId,
        type: 'games',
        email,
        ...games,
      })
    } else {
      await couch.update(dbName, { ...data.rows[0].value, ...games })
    }
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}

/**
 * Get all my steam games just like in /games,
 * combine data so each game has steam data + igdb id
 * save to database, so that when clicking a game,
 * the extended data can be displayed
 * @param {*} req
 * @param {*} res
 */
const buildGamesDb = async (req, res) => {
  const email = await verifyToken(req, res)
  if (!email) {
    return
  }
  // const email = 'fraijilverto@hotmail.com'
  const dbUser = await userDB.getUser(email)
  if (!dbUser) {
    return
  }
  const steamId = dbUser.value.steam

  fetch(
    `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_KEY}&steamid=${steamId}&include_appinfo=true&format=json`,
  )
    .then((r) => r.json())
    .then(async (body) => {
      const steamGamesList = body.response.games
      const steamGamesDictionary = steamGamesList.reduce(
        (dictionary, game) => ({
          ...dictionary,
          [game.appid]: game,
        }),
        {},
      )

      const missing = []
      let index = 0
      // the increment is 1, more than one games could be processed at the same time,
      // but IGDB returns a max of 10 website links at a time. So in case a single game returns
      // multiple websites, to be safe, only one is processed in case of overflow and data loss
      const increment = 1
      while (index < steamGamesList.length) {
        const chunk = steamGamesList.slice(index, index + increment)
        index += increment

        console.log(`index ${index / increment} of ${Math.ceil(steamGamesList.length / increment)}`)

        // eslint-disable-next-line no-await-in-loop
        const { games, missing: _missing } = await getIGDBGameIds(chunk)
        missing.push(..._missing)
        games.forEach((game) => {
          const steamGame = steamGamesDictionary[game.appid]
          if (steamGame) {
            steamGame.id = game.id
          }
        })

        // Wait a bit to not call too soon the IGDB api. IGDB has a max of 4 calls per second
        // let's not abuse it and call it once per second
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      await saveGamesToDB(email, { games: steamGamesList, missingSteamGames: missing })

      res.send({ games: steamGamesDictionary, missing, count: missing.length })
    })
}

/* eslint-disable object-curly-newline */
module.exports = {
  buildGamesDb,
}
