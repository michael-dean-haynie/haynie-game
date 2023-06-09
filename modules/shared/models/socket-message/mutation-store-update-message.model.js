const SocketMessage = require('./socket-message')

module.exports = class MutationStoreUpdateMessage extends SocketMessage {
  constructor(param) {
    super(param)

    const { tick, mutations } = param
    this.tick = tick
    this.mutations = mutations
  }
}
