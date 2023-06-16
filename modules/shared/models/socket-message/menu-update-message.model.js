const SocketMessage = require('./socket-message')

module.exports = class MenuUpdateMessage extends SocketMessage {
  constructor(param) {
    super(param)

    const { gameKeys } = param
    this.gameKeys = gameKeys
  }
}
