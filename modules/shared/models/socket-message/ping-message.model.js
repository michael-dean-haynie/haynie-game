module.exports = class PingMessage {
  constructor({
    startTimestamp,
  } = {}) {
    this.messageType = this.constructor.name
    this.startTimestamp = startTimestamp
  }
}
