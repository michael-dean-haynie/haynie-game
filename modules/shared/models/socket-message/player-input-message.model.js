const SocketMessage = require('./socket-message')

module.exports = class PlayerInputMessage extends SocketMessage {
  constructor(param) {
    super(param)

    const { playerInput } = param
    this.playerInput = playerInput
  }
}
