import { config } from '../shared/config.mjs'

export class RenderingEngine {
  constructor (canvas) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')

    this.canvas.width = config.gameWidth
    this.canvas.height = config.gameHeight

    this.diagnostics = {
      fps: 0,
      frames: 0,
      tps: 0,
      ticks: 0,
      aps: 0,
      ups: 0,
      ping: 0
    }
  }

  render (gameState) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    gameState.players.forEach(player => {
      this.context.fillStyle = player.color
      const x = player.x - (player.width / 2)
      const y = player.y + (player.width / 2)
      this.context.fillRect(x, this.iy(y), 50, 50)
    })

    this.printDiagnostics()
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
    for (const [key, value] of Object.entries(this.diagnostics)) {
      this.context.fillText(`${key}: ${value}`, 12, this.iy((line++) * lineHeight))
    }
  }
}
