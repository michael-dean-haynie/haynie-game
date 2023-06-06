module.exports = class PlayerInputMessage {
  constructor({
    playerInput
  } = {}) {
    this.messageType = this.constructor.name
    this.playerInput = playerInput
  }
}
