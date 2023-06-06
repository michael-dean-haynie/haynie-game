module.exports = class PlayerLeftEvent {
  constructor({
    playerId,
    player,
    playerIndex
  } = {}) {
    this.eventType = this.constructor.name
    this.playerId = playerId
    this.player = player
    this.playerIndex = playerIndex
  }

  mutate(gameState) {
    this.playerIndex = gameState.players.findIndex(plyr => plyr.id === this.playerId)
    this.player = gameState.players[this.playerIndex]
    gameState.players.splice(this.playerIndex, 1)
  }

  revert(gameState) {
    gameState.players.splice(this.playerIndex, 0, this.player)
  }
}
