const SocketMessage = require('./socket-message')

module.exports = class JoinGameMessage extends SocketMessage {
  constructor(param) {
    super(param)

    const { gameKey } = param
    this.gameKey = gameKey
  }
}
