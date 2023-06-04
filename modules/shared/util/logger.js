const debug = require('debug')

module.exports = (namespace) => {
  const logger = debug(namespace)
  logger.enabled = true
  return logger
}
