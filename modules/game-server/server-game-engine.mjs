import { Logger} from "../shared/util/logger.mjs";
import {SmoothDiagnostic} from "../shared/util/smooth-diagnostic.mjs";

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
        this.tps = new SmoothDiagnostic(0.99, 10)
        this.playerApsMap = new Map()

        this.subscriptions = []

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
            const msSinceLastTick = (now - this.previousTickTs)
            this.updateTps(msSinceLastTick)
            this.updateAps(msSinceLastTick)

            // publish diagnostics update every so many ticks
            const aps = {}
            for (let [playerId, smoothAps] of this.playerApsMap) {
                aps[playerId] = Math.floor(smoothAps.smoothValue)
            }
            if (this.tick % 50 === 0) {
                this.publish({
                    tps: Math.floor(this.tps.smoothValue),
                    ticks: this.tick,
                    aps
                })
            }

            const lastTickTs = this.previousTickTs
            this.previousTickTs = now

            this.tick++
            this.update(lastTickTs, now)

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

    update(lastTickTs, currentTickTs) {
        Logger.verbose(`Entering ServerGameEngine.update() [tick=${this.tick}, lastTickTs=${lastTickTs}, currentTickTs=${currentTickTs}]`)
        this.gameStateEngine.update(lastTickTs, currentTickTs);
    }

    updateTps(msSinceLastTick) {
        const currentTps = 1000 / msSinceLastTick
        this.tps.update(currentTps)
    }

    // TODO: make this ... not terrible
    updateAps(msSinceLastTick) {
        const playerActionCountMap = new Map()
        for (let input of this.gameStateEngine.inputQueue) {
            if (playerActionCountMap.has(input.playerId)) {
                playerActionCountMap.set(input.playerId, playerActionCountMap.get(input.playerId) + 1)
            } else {
                playerActionCountMap.set(input.playerId, 1)
            }
        }
        for (let [playerId, actionCount] of playerActionCountMap) {
           if (this.playerApsMap.has(playerId)){
               this.playerApsMap.get(playerId).update((1000 / msSinceLastTick) * actionCount)
           } else {
               this.playerApsMap.set(playerId, new SmoothDiagnostic(0.99, 0))
           }
        }
        const playersThatHadNoActions =
            Array.from(this.playerApsMap.keys())
                .filter(playerId => !Array.from(playerActionCountMap.keys()).includes(playerId))
        playersThatHadNoActions.forEach(playerId => {
            this.playerApsMap.get(playerId).update(0)
        })
    }



    // right now pub/sub only for diagnostics but could make game state engine subscribe
    registerSubscription(subscription) {
        this.subscriptions.push(subscription)
    }

    publish(diagnostics) {
        this.subscriptions.forEach(subscription => {
            subscription(diagnostics)
        })
    }
}
