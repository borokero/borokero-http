// const mongoPersistence = require("aedes-persistence-mongodb");
const HTTP = require('./lib/http')
const aedes = require('aedes')()
var authBroker = require('@borokero/borokero-auth')
const debug = require('debug')('borokero-iot-http')

const options = {
  mqtt: {
    port: 1883
  },
  http: {
    port: 3000
  },
  db: {
    url: process.env.MONGO_URL,
    // Optional ttl settings
    ttl: {
      packets: process.env.MONGO_TTL_PACKETS, // Number of seconds
      subscriptions: process.env.MONGO_TTL_SUB
    }
  },
  envAuth: {
    auth: {
      realm: process.env.REALM,
      "auth-server-url": process.env.AUTH_SERVER_URL,
      "ssl-required": process.env.SSL_REQUIRED,
      resource: process.env.RESOURCE,
      "public-client": process.env.PUBLIC_CLIENT,
      "confidential-port": process.env.CONFIDENTIAL_PORT,
    }
  }
}


const authbroker = new authBroker(options.envAuth)

aedes.on('retained', function (topic, payload) {
  debug(
    'Topic: \x1b[33m" + topic + "\x1b[0m',
    'updated to: ',
    payload.toString()
  )
})

const http = new HTTP({
    brokero: aedes,
    port: options.http.port,
    authenticate: authbroker.authenticateWithAccessToken(),
    authorizeGet: authbroker.authorizeSubscribe(),
    authorizePut: authbroker.authorizePublish()
  },
  function (err, res) {
    console.log(err)
  })