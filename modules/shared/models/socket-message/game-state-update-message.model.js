module.exports = class GameStateUpdateMessage {
  constructor({
    gameState
  } = {}) {
    this.messageType = this.constructor.name
    this.gameState = gameState
  }
}
