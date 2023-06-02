import { Logger} from "../shared/util/logger.mjs";
import {SmoothDiagnostic} from "../shared/util/smooth-diagnostic.mjs";

/**
 * TODO: esplain this is the thing that drives the client, what it's responsible for
 */
export class ClientGameEngine {
    constructor(gameStateEngine, renderingEngine) {
        this.gameStateEngine = gameStateEngine
        this.renderingEngine = renderingEngine
        this.previousFrameTs = Date.now()
        this.frame = 0
        this.fps = new SmoothDiagnostic(0.99, 10)
    }

    start() {
        Logger.info("Starting ClientGameEngine");
        window.requestAnimationFrame(this.gameLoop.bind(this))
    }

    gameLoop() {
        this.frame++
        const now = Date.now()
        this.updateFps(now, this.previousFrameTs)
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
        this.renderingEngine.diagnostics.frames = this.frame
        this.renderingEngine.diagnostics.fps = Math.floor(this.fps.smoothValue)
        this.renderingEngine.render(this.gameStateEngine.gameState)
    }

    updateFps(currentFrameTs, previousFrameTs) {
        const currentFps = 1000 / (currentFrameTs - previousFrameTs)
        this.fps.update(currentFps)
    }
}
