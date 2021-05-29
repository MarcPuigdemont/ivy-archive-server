const fetch = require('node-fetch')
const { TWITCH: { CLIENT_ID, SECRET } } = require('../.keys.json')

const login = async () => {
  const token = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${SECRET}&grant_type=client_credentials`,
    { method: 'POST' },
  ).then((res) => res.json())

  console.log('successfully logged to Twitch')
  return token
}

module.exports = {
  login,
  CLIENT_ID,
}
