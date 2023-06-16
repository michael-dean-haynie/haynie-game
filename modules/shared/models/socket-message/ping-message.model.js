const SocketMessage = require('./socket-message')

module.exports = class PingMessage extends SocketMessage {
  constructor(param) {
    super(param)

    const { startTimestamp, apm, tps } = param
    this.startTimestamp = startTimestamp
    this.apm = apm
    this.tps = tps
  }
}
