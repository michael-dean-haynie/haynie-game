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
    }

    start() {
        Logger.info("Starting ClientGameEngine");
        window.requestAnimationFrame(this.gameLoop.bind(this))
    }

    gameLoop() {
        const now = Date.now()

        this.frame++
        // Logger.verbose(`Entering ClientGameEngine.gameLoop() [ts=${now}]`)

        this.update()
        this.draw()

        window.requestAnimationFrame(this.gameLoop.bind(this))
    }

    update() {
        Logger.verbose(`Entering ClientGameEngine.update() [frame=${this.frame}]`)

    }

    draw() {
        this.renderingEngine.render(this.gameStateEngine.gameState)
    }
}
