if ('undefined' === typeof window) {
  module.exports = require('./server')
} else {
  module.exports = require('./client')
}