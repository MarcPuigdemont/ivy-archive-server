const NodeCouchDB = require('node-couchdb')
const { COUCH_DB: { USER, PASSWORD, DB_NAME: dbName } } = require('../.keys.json')

const usersUrl = '_design/users/_view'
const gamesUrl = '_design/games/_view'
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
  usersUrl,
  gamesUrl,
  couch,
}
