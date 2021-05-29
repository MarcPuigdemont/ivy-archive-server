const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { userUtils } = require('../utils/user')
const { couch, dbName, usersUrl } = require('../utils/database')
const { privateKey } = require('../utils/jwt')

const userDB = userUtils(couch, dbName, usersUrl)

const login = async (req, res) => {
  try {
    const user = req.body
    const dbUser = await userDB.getUser(user.email)
    if (dbUser) {
      const validUser = await bcrypt.compare(user.password, dbUser.value.password)
      if (validUser) {
        const token = jwt.sign({ email: user.email }, privateKey, { expiresIn: '1h' })
        res.send({ token })
        return
      }
    }
  } catch (err) {
    console.err(err)
  }
  res.status(401).send({ error: 'Invalid user or password' })
}

/* eslint-disable object-curly-newline */
module.exports = {
  login,
}
