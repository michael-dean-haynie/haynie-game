module.exports = class Logger {
  static level = 1
  static levels = {
    verbose: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4
  }

  static ts () {
    return new Date().toISOString()
  }

  static verbose (message) {
    if (Logger.level <= Logger.levels.verbose) {
      console.log(`[${Logger.ts()}] [VERBOSE]`, message)
    }
  }

  static debug (message) {
    if (Logger.level <= Logger.levels.debug) {
      console.log(`[${Logger.ts()}] [DEBUG]`, message)
    }
  }

  static info (message) {
    if (Logger.level <= Logger.levels.info) {
      console.log(`[${Logger.ts()}] [INFO]`, message)
    }
  }

  static warn (message) {
    if (Logger.level <= Logger.levels.warn) {
      console.log(`[${Logger.ts()}] [WARN]`, message)
    }
  }

  static error (message) {
    if (Logger.level <= Logger.levels.error) {
      console.log(`[${Logger.ts()}] [ERROR]`, message)
    }
  }
}
