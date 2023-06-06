module.exports = class GameState {
  constructor({
    gameHeight,
    gameWidth,
    tick = 0,
    players = []
  } = {}) {
    this.gameHeight = gameHeight
    this.gameWidth = gameWidth
    this.tick = tick
    this.players = players
  }
}
