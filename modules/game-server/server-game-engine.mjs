import { Logger} from "../shared/util/logger.mjs";

/**
 * TODO: esplain - this is the engine that drives the server, what it's responsible for
 * inspiration: https://timetocode.tumblr.com/post/71512510386/an-accurate-node-js-game-loop-inbetween-settimeout-and
 */
export class ServerGameEngine {
    constructor(gameStateEngine) {
        this.gameStateEngine = gameStateEngine
        // Length of a tick in milliseconds. The denominator is your desired framerate.
        // e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps
        this.tickLengthMs = 1000 / 60
        this.tick = 0

        // The margin of error that setTimeout may experience. (suggested 16, tweak-able, depends on os/cpu)
        this.timeoutMarginOfErrorMs = 4
        this.previousTickTs = Date.now()

        // Metrics
        this.gameLoopInvocations = 0
        this.setTimeouts = 0
        this.setImmediates = 0


        // Testing Options
        this.maxTicks = null
    }

    start() {
        Logger.info("Starting ServerGameEngine");
        setImmediate(this.gameLoop.bind(this))
    }

    gameLoop() {
        const now = Date.now()

        this.gameLoopInvocations++
        // Logger.verbose(`Entering ServerGameEngine.gameLoop() [ts=${now}]`)


        if (this.previousTickTs + this.tickLengthMs <= now) {
            const delta = (now - this.previousTickTs)
            this.previousTickTs = now

            this.tick++
            this.update(delta)

            // testing feedback
            if (this.maxTicks && this.tick >= this.maxTicks) {
                Logger.info('Stopping game loop.');
                Logger.info(`maxTicks reached (${this.tick}/${this.maxTicks}).`)
                Logger.info(`tickLengthMs: ${this.tickLengthMs}`)
                Logger.info(`gameLoopInvocations per tick: ${this.gameLoopInvocations / this.tick}`);
                Logger.info(`setTimeouts per tick: ${this.setTimeouts / this.tick}`);
                Logger.info(`setImmediates per tick: ${this.setImmediates / this.tick}`);
                return
            }
        }

        if (now - this.previousTickTs < this.tickLengthMs - this.timeoutMarginOfErrorMs) {
            this.setTimeouts++
            setTimeout(this.gameLoop.bind(this))
        } else {
            this.setImmediates++
            setImmediate(this.gameLoop.bind(this))
        }
    }

    update(delta) {
        Logger.verbose(`Entering ServerGameEngine.update() [tick=${this.tick}, delta=${delta}]`)
        this.gameStateEngine.update(delta);
    }
}
