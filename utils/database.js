const NodeCouchDB = require('node-couchdb')
const { COUCH_DB: { USER, PASSWORD, DB_NAME: dbName } } = require('../.keys.json')

const designUsersUrl = '_design/users'
const designGamesUrl = '_design/games'
const usersUrl = `${designUsersUrl}/_view`
const gamesUrl = `${designGamesUrl}/_view`
const couch = new NodeCouchDB({
  /*
   * Configurable arguments:
   protocol: 'http',
   host: '127.0.0.1',
   port: '5984',
   cache: null,
   timeout: 5000,
   */
  auth: {
    password: PASSWORD,
    user: USER,
  },
})

module.exports = {
  dbName,
  designUsersUrl,
  designGamesUrl,
  usersUrl,
  gamesUrl,
  couch,
}
