module.exports = class PingMessage {
  constructor({
    startTimestamp,
    apm
  } = {}) {
    this.messageType = this.constructor.name
    this.startTimestamp = startTimestamp
    this.apm = apm
  }
}
