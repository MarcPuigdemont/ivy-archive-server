const userUtils = (couch, dbName, usersUrl) => ({
  getUser: async (email, res) => {
    try {
      const { data } = await couch.get(dbName, `${usersUrl}/by-email?key="${email}"`)
      if (data.rows.length === 1) {
        return data.rows[0]
      }

      const errorMessage = data.rows.length === 0
        ? 'User does not exist'
        : 'There are multiple users with the same email. Please contact admin.'
      if (res) {
        res.status(500).send({ error: errorMessage })
      }

      return null
    } catch (err) {
      if (res) {
        res.send(err)
      }

      return null
    }
  },
})

/* eslint-disable object-curly-newline */
module.exports = {
  userUtils,
}
