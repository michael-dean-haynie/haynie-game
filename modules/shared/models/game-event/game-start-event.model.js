module.exports = class GameStartEvent {
  constructor() {
    this.eventType = this.constructor.name
  }

  mutate(gameState) {
    // empty for now
  }

  revert(gameState) {
    // empty for now
  }
}
