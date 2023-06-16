const SocketMessage = require('./socket-message')

module.exports = class FastForwardMessage extends SocketMessage {
  constructor({
    tickTuples
  } = {}) {
    super({ tickTuples })
    this.tickTuples = tickTuples
  }
}
