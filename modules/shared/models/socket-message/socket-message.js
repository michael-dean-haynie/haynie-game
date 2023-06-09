module.exports = class SocketMessage {
  constructor({
    messageType
  } = {}) {
    this.messageType = messageType || this.constructor.name
  }
}
