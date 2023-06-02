import { config } from "../shared/config.mjs";

export class RenderingEngine {
    constructor(canvas) {
        this.canvas = canvas
        this.context = canvas.getContext('2d')

        this.canvas.width = config.gameWidth
        this.canvas.height = config.gameHeight

        this.diagnostics = {
            fps: 0
        }
    }

    render(gameState, fps) {
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height)
        gameState.players.forEach(player => {
            this.context.fillStyle = player.color
            const x = player.x - (player.width / 2)
            const y = player.y + (player.width / 2)
            this.context.fillRect(x, this.iy(y), 50, 50)
        })

        this.diagnostics.fps = fps
        this.printDiagnostics()
    }

    // Invert the y-axis
    iy(y) {
        return canvas.height - y;
    }

    printDiagnostics() {
        this.context.fillStyle = 'black'
        this.context.font = '12px Arial'
        this.context.fillText(`fps: ${this.diagnostics.fps}`, 12, this.iy( 12))
    }
}
