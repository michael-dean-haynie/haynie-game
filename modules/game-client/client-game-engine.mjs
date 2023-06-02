import { Logger} from "../shared/util/logger.mjs";

/**
 * TODO: esplain this is the thing that drives the client, what it's responsible for
 */
export class ClientGameEngine {
    constructor(gameStateEngine, renderingEngine) {
        this.gameStateEngine = gameStateEngine
        this.renderingEngine = renderingEngine
        this.previousFrameTs = Date.now()
        this.frame = 0
        this.fpsSmoothing = 0.99 // closer to 1.0 = more smoothing
        this.smoothFps = 0
    }

    start() {
        Logger.info("Starting ClientGameEngine");
        window.requestAnimationFrame(this.gameLoop.bind(this))
    }

    gameLoop() {
        this.frame++
        const now = Date.now()
        this.updateSmoothFps(now, this.previousFrameTs)
        this.previousFrameTs = now


        // Logger.verbose(`Entering ClientGameEngine.gameLoop() [ts=${now}]`)


        this.update()

        this.draw()

        window.requestAnimationFrame(this.gameLoop.bind(this))
    }

    update() {
        Logger.verbose(`Entering ClientGameEngine.update() [frame=${this.frame}]`)
        // TODO - implement predictive state updates
    }

    draw() {
        this.renderingEngine.render(this.gameStateEngine.gameState, Math.floor(this.smoothFps))
    }

    updateSmoothFps(currentFrameTs, previousFrameTs) {
        const fps = 1000 / (currentFrameTs - previousFrameTs)
        if (this.frame < 5) {
            this.smoothFps = fps // skip smoothing for the first few frames
        } else {
            this.smoothFps = (this.smoothFps * this.fpsSmoothing) + (fps * (1.0 - this.fpsSmoothing))
        }
    }
}
