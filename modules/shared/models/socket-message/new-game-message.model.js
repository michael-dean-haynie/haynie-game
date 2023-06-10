const SocketMessage = require('./socket-message')

module.exports = class NewGameMessage extends SocketMessage {
  constructor(param) {
    super(param)
  }
}
