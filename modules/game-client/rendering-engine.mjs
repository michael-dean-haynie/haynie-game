export class RenderingEngine {
    constructor(cavas) {
        this.canvas = canvas
        this.context = canvas.getContext('2d')
    }

    render(gameState) {
        this.context.clearRect(0,0, canvas.width, canvas.height)
        gameState.units.forEach(unit => {
            this.context.fillStyle = '#ff8080'
            this.context.fillRect(unit.x, this.iy(unit.y), 50, 50)
        })
    }

    // Invert the y axis
    iy(y) {
        return canvas.height - y;
    }
}
