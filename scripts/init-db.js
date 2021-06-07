const { dbName, designUsersUrl, designGamesUrl, couch } = require('../utils/database')

const designUsers = {
  _id: designUsersUrl,
  views: {
    'by-email': {
      map: 'function (doc) {\n  if (doc.type === "user") {\n    emit(doc.email, doc);\n  }\n}',
    },
    'by-id': {
      map: 'function (doc) {\n  if (doc.type === "user") {\n    emit(doc._id, doc);\n  }\n}',
    },
  },
  language: 'javascript',
}

const designGames = {
  _id: designGamesUrl,
  views: {
    'by-email': {
      map: 'function (doc) {\n  if (doc.type === "games") {\n    emit(doc.email, doc);\n  }\n}',
    },
  },
  language: 'javascript',
}

const createDesignUsersDocument = () =>
  couch.get(dbName, designUsersUrl)
    .then(() => console.log('Design document for users already exists, skipping...'))
    .catch((err) => {
      if (err.code === 'EDOCMISSING') {
        console.log('Design document fore users does not exist, creating:')
        return couch.insert(dbName, designUsers)
          .then(() => console.log('Design document for users created'))
          .catch((error) => {
            console.log('Unexpected error while inserting design document for users')
            throw error
          })
      }

      console.log('Unexpected error while checking for design document for users')
      throw err
    })

const createDesignGamesDocument = () =>
  couch.get(dbName, designGamesUrl)
    .then(() => console.log('Design document for games already exists, skipping...'))
    .catch((err) => {
      if (err.code === 'EDOCMISSING') {
        console.log('Design document fore games does not exist, creating:')
        return couch.insert(dbName, designGames)
          .then(() => console.log('Design document for games created'))
          .catch((error) => {
            console.log('Unexpected error while inserting design document for games')
            throw error
          })
      }

      console.log('Unexpected error while checking for design document for games')
      throw err
    })

couch.listDatabases()
  .then(async (databases) => {
    try {
      if (databases.includes(dbName)) {
        console.log('Database already esxists, skipping creation...')
      } else {
        console.log('Creating database:')
        await couch.createDatabase(dbName)
        console.log('Database created')
      }
      await createDesignUsersDocument()
      await createDesignGamesDocument()
      console.log('All done!')
    } catch (error) {
      console.log(error)
    }
  })
  .catch((error) => console.log(error))
