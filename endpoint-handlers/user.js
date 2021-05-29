const bcrypt = require('bcrypt')
const fetch = require('node-fetch')

const { STEAM_KEY } = require('../.keys.json')
const { userUtils } = require('../utils/user')
const { verifyToken, saltRounds } = require('../utils/jwt')
const { couch, dbName, usersUrl } = require('../utils/database')

const userDB = userUtils(couch, dbName, usersUrl)

const getUser = async (req, res) => {
  try {
    const email = await verifyToken(req, res)
    if (!email) {
      return
    }
    const user = await userDB.getUser(email, res)
    if (user) {
      res.send(user)
    }
  } catch (err) {
    res.status(500).send(err)
  }
}

const addUser = async (req, res) => {
  const newUser = req.body

  try {
    const { data } = await couch.get(dbName, `${usersUrl}/by-email?key="${newUser.email}"`)
    if (data.rows.length === 0) {
      const newId = (await couch.uniqid())[0]
      const password = await bcrypt.hash(newUser.password, saltRounds)
      const { data: insertedUser } = await couch.insert(dbName, {
        _id: newId,
        type: 'user',
        username: newUser.username,
        email: newUser.email,
        password,
        steam: newUser.steam,
        epic: newUser.epic,
        gog: newUser.gog,
        origin: newUser.origin,
        uplay: newUser.uplay,
      })
      res.send(insertedUser)
    } else {
      res.status(500).send('User with the same email already exists')
    }
  } catch (err) {
    res.status(500).send(err)
  }
}

const updateUser = async (req, res) => {
  const newUser = req.body
  if (!await verifyToken(req, res)) {
    return
  }

  try {
    const { data } = await couch.get(dbName, `${usersUrl}/by-email?key="${newUser.email}"`)
    if (data.rows.length !== 1) {
      const errorMessage = data.rows.length === 0
        ? 'User does not exist'
        : 'There are multiple users with the same email. Please contact admin.'
      res.status(500).send({ error: errorMessage })
      return
    }
    let password = {}
    if (newUser.password !== '') {
      password = { password: await bcrypt.hash(newUser.password, saltRounds) }
    }

    const result = await couch.update(dbName, { ...data.rows[0].value, ...newUser, ...password })
    res.send(result.data)
  } catch (err) {
    res.status(500).send(err)
  }
}

const getUserGeneralInfo = async (req, res) => {
  const email = await verifyToken(req, res)
  if (!email) {
    return
  }
  const user = await userDB.getUser(email, res)
  fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${user.value.steam}`)
    .then((r) => r.text())
    .then((body) => {
      res.send(body)
    })
}

module.exports = {
  getUser,
  addUser,
  updateUser,
  getUserGeneralInfo,
}
