const jwt = require('jsonwebtoken')
const { JWT: privateKey } = require('../.keys.json')

const saltRounds = 10

const verifyToken = (req, res) => {
  const token = Array.isArray(req.headers.jwt) ? req.headers.jwt[0] : req.headers.jwt
  return new Promise((resolve) => {
    jwt.verify(token, privateKey, (error, decoded) => {
      if (error) {
        if (error.name === 'TokenExpiredError') {
          res.status(401).send(error)
        } else {
          res.status(500).send(error)
        }
      } else {
        resolve((decoded && decoded.email) || null)
      }
    })
  })
}

module.exports = {
  verifyToken,
  privateKey,
  saltRounds,
}
