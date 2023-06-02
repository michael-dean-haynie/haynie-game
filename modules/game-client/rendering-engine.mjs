import { config } from "../shared/config.mjs";

export class RenderingEngine {
    constructor(canvas) {
        this.canvas = canvas
        this.context = canvas.getContext('2d')

        this.canvas.width = config.gameWidth
        this.canvas.height = config.gameHeight
    }

    render(gameState) {
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height)
        gameState.players.forEach(player => {
            this.context.fillStyle = player.color
            const x = player.x - (player.width / 2)
            const y = player.y + (player.width / 2)
            this.context.fillRect(x, this.iy(y), 50, 50)
        })
    }

    // Invert the y-axis
    iy(y) {
        return canvas.height - y;
    }
}
