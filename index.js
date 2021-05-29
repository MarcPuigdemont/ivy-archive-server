const express = require('express')
const cors = require('cors')

const userEndpointHandler = require('./endpoint-handlers/user')
const authenticationEndpointHandler = require('./endpoint-handlers/authentication')
const buildGamesDatabaseEndpointHandler = require('./endpoint-handlers/build-games-db')
const gamesEndpointHandler = require('./endpoint-handlers/games')

const app = express()
app.use(cors())
app.use(express.json())

app.post('/login', authenticationEndpointHandler.login)
app.get('/general-info', userEndpointHandler.getUserGeneralInfo)
app.get('/user', userEndpointHandler.getUser)
app.post('/user', userEndpointHandler.addUser)
app.put('/user', userEndpointHandler.updateUser)
app.get('/games', gamesEndpointHandler.getUserGames)
app.get('/build-steam-igdb-games', buildGamesDatabaseEndpointHandler.buildGamesDb)

/* eslint-disable no-magic-numbers  */
app.listen(3000, () => {
  console.log('Ivy server listening on port 3000!')
})

/* -------------------------------- UNUSED -------------------------------- */

/* eslint-disable */
/*
app.get("/lists", function (req, res) {
  fetch("https://api.igdb.com/v4/collections", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${igdbToken.access_token}`,
    },
    body: "fields checksum,created_at,games,name,slug,updated_at,url;",
  })
    .then((res) => res.json())
    .then((lists) => res.send(lists))
    .catch((err) => {
      console.error(err)
    })
})

app.get("/igdb-games", function (req, res) {
  const fields =
    "fields age_ratings,aggregated_rating,aggregated_rating_count,alternative_names,artworks,bundles,category,checksum,collection,cover,created_at,dlcs,expansions,external_games,first_release_date,follows,franchise,franchises,game_engines,game_modes,genres,hypes,involved_companies,keywords,multiplayer_modes,name,parent_game,platforms,player_perspectives,rating,rating_count,release_dates,screenshots,similar_games,slug,standalone_expansions,status,storyline,summary,tags,themes,total_rating,total_rating_count,updated_at,url,version_parent,version_title,videos,websites.*;"
  const condition = `search "Jedi outcast";`
  fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${igdbToken.access_token}`,
    },
    body: fields + condition,
  })
    .then((res) => res.json())
    .then((games) => res.send(games))
    .catch((err) => {
      console.error(err)
    })
})

app.get("/igdb-websites", function (req, res) {
  const { appid } = req.query
  const fields = "fields category,checksum,game,trusted,url;"
  const condition = `where category=13 & url ~ "https://store.steampowered.com/app/${appid}"*;`
  fetch("https://api.igdb.com/v4/websites", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${igdbToken.access_token}`,
    },
    body: fields + condition,
  })
    .then((res) => res.json())
    .then((games) => res.send(games))
    .catch((err) => {
      console.error(err)
    })
})

app.get("/game_stats", function (req, res) {
  const { appid } = req.query
  const steamId = 1234 // get steam id
  console.log(appid)
  fetch(
    `http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appid}&key=${STEAM_KEY}&steamid=${steamId}&format=json`
  )
    .then((r) => r.text())
    .then((body) => {
      res.send(body)
    })
    .catch((error) => {
      console.log(error)
    })
})

app.get("/game_schema", function (req, res) {
  const { appid } = req.query
  fetch(`http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${STEAM_KEY}&appid=${appid}`)
    .then((r) => r.text())
    .then((body) => {
      res.send(body)
    })
})
*/
/* eslint-enable */
