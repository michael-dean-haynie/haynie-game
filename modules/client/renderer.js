const config = require('../shared/config.js')

module.exports = class Renderer {
  constructor (canvas, liveDiagnostics) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')

    this.canvas.width = config.gameWidth
    this.canvas.height = config.gameHeight

    this.liveDiagnostics = liveDiagnostics
    this.logger = require('../shared/util/logger')(this.constructor.name)
  }

  render (gameState) {
    this.logger('rendering')
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    gameState.players.forEach(player => {
      this.context.fillStyle = player.color
      const x = player.position.x - (player.width / 2)
      const y = player.position.y + (player.width / 2)
      this.context.fillRect(x, this.iy(y), player.width, player.width)
    })

    this.liveDiagnostics.ticks = gameState.tick
    // this.printDiagnostics() // TODO: fix and enable
  }

  // Invert the y-axis
  iy (y) {
    return this.canvas.height - y
  }

  printDiagnostics () {
    this.context.fillStyle = 'black'
    this.context.font = '12px Arial'
    const lineHeight = 12

    let line = 1
    for (const [key, value] of Object.entries(this.liveDiagnostics)) {
      this.context.fillText(`${key}: ${value}`, 12, this.iy((line++) * lineHeight))
    }
  }
}
