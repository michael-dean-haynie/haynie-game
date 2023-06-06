module.exports = class PlayerVectorChangedEvent {
  constructor({
    playerId,
    oldVector,
    newVector
  } = {}) {
    this.eventType = this.constructor.name
    this.playerId = playerId
    this.oldVector = oldVector
    this.newVector = newVector
  }

  mutate(gameState) {
    const player = gameState.players.find(plyr => plyr.id === this.playerId)
    this.oldVector = player.vector
    player.vector = this.newVector
  }

  revert(gameState) {
    const player = gameState.players.find(plyr => plyr.id === this.playerId)
    player.vector = this.oldVector
  }
}
