const { verifyToken } = require('../utils/jwt')
const { couch, dbName, gamesUrl } = require('../utils/database')

const getUserGames = async (req, res) => {
  const email = await verifyToken(req, res)
  if (!email) {
    return
  }
  try {
    const { data } = await couch.get(dbName, `${gamesUrl}/by-email?key="${email}"`)
    if (data.rows.length === 1) {
      res.send(data.rows[0])
    } else {
      const errorMessage = data.rows.length === 0
        ? 'Game list does not exist'
        : 'There are multiple game lists with the same email. Please contact admin.'
      if (res) {
        res.status(500).send({ error: errorMessage })
      }
    }
  } catch (err) {
    if (res) {
      res.status(500).send(err)
    }
  }
}

/* eslint-disable object-curly-newline */
module.exports = {
  getUserGames,
}
