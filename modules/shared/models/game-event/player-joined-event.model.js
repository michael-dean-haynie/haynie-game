module.exports = class PlayerJoinedEvent {
  constructor({
    player
  } = {}) {
    this.eventType = this.constructor.name
    this.player = player
  }

  mutate(gameState) {
    gameState.players.push(this.player)
  }

  revert(gameState) {
    gameState.players = gameState.players.filter(plyr => plyr.id !== this.player.id)
  }
}
