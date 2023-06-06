module.exports = class PingMessage {
  constructor({
    startTimestamp,
    apm,
    tps
  } = {}) {
    this.messageType = this.constructor.name
    this.startTimestamp = startTimestamp
    this.apm = apm
    this.tps = tps
  }
}
