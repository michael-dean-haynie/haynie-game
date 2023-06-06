const SmoothDiagnostic = require('../shared/util/smooth-diagnostic.js')

/**
 * TODO: esplain - this is the engine that drives the server, what it's responsible for
 * inspiration: https://timetocode.tumblr.com/post/71512510386/an-accurate-node-js-game-loop-inbetween-settimeout-and
 *
 * Terminology:
 * * 'game loop' - A cycle of the lowest level loop. If enough time has passed since the last 'tick', it will trigger the next 'tick'.
 * * 'tick' - A cycle of the game loop that is permitted to complete (make logic updates, process inputs, have side effects)
 */
module.exports = class ServerGameEngine {
  constructor (gameStateManager) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.gameStateManager = gameStateManager

    // Length of a tick in milliseconds. The denominator is your desired framerate.
    // e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps
    this.tickLengthMs = 1000 / 60
    this.lastTickTs = Date.now()
    this.ticks = 0

    this.kill = 0

    this.now = Date.now()

    // The margin of error that setTimeout may experience. (suggested 16, tweak-able, depends on os/cpu)
    this.timeoutMarginOfErrorMs = 4

    this.gameLoops = 0
    this.setTimeouts = 0
    this.setImmediates = 0

    this.tpsSD = new SmoothDiagnostic(0.99, 10)
    this.playerApsMap = new Map()

    this.subscriptions = []

    // Testing Options
    this.maxTicks = null
  }

  start () {
    this.logger('Server game engine started.')
    setImmediate(this.gameLoop.bind(this))
  }

  /**
   * * This is the lowest level loop on the game server (excluding the runtime-native event loop, of course)
   * * This loop checks if the next tick is due, triggers it if so, and then schedules the next loop
   * * Loop-scheduling uses a mix of `setTimeout()` and node's `setImmediate()` to reduce the total loops
   * executed while maintaining reasonable ticks-per-second accuracy
   */
  gameLoop () {
    // kill the game loop if kill signal is set
    if (this.kill) {
      return
    }

    this.gameLoops++
    this.now = Date.now()

    // trigger the next tick() invocation if it is due
    let msSinceLastTick = this.now - this.lastTickTs
    const nextTickIsDue = msSinceLastTick >= this.tickLengthMs
    if (nextTickIsDue) {
      this.tick(msSinceLastTick)
      msSinceLastTick = 0
    }

    // schedule the next gameLoop() invocation
    const msSinceLastTickHasReachedTimeoutMarginOfError =
      msSinceLastTick < this.tickLengthMs - this.timeoutMarginOfErrorMs

    if (msSinceLastTickHasReachedTimeoutMarginOfError) {
      this.setImmediates++
      setImmediate(this.gameLoop.bind(this))
    } else {
      this.setTimeouts++
      setTimeout(this.gameLoop.bind(this))
    }
  }

  /**
   * This is where game-logic progression happens.
   * Ideally it should be divorced from any real time units, so that the game-speed can be manipulated.
   */
  tick(msSinceLastTick) {
    this.ticks++

    // publish diagnostics update every so many ticks
    this.updateTps(msSinceLastTick)
    this.updateAps(msSinceLastTick)
    const aps = {}
    for (const [playerId, smoothAps] of this.playerApsMap) {
      aps[playerId] = Math.floor(smoothAps.smoothValue)
    }
    if (this.ticks % 50 === 0) {
      this.publish({
        tps: Math.floor(this.tpsSD.smoothValue),
        ticks: this.ticks,
        aps
      })
    }

    // actually do game stuff
    const currentTickTs = this.lastTickTs + msSinceLastTick
    // this.gameStateManager.update(this.lastTickTs, currentTickTs)
    this.gameStateManager.stepForward()

    // finish this tick by progressing the lastTickTs marker
    this.lastTickTs = currentTickTs

    // kill if max ticks has been reached
    if (this.maxTicks && this.ticks >= this.maxTicks) {
      this.kill = 1
    }
  }

  updateTps (msSinceLastTick) {
    const currentTps = 1000 / msSinceLastTick
    this.tpsSD.update(currentTps)
  }

  // TODO: make this ... not terrible
  updateAps (msSinceLastTick) {
    // const playerActionCountMap = new Map()
    // for (const input of this.gameStateManager.inputQueue) {
    //   if (playerActionCountMap.has(input.playerId)) {
    //     playerActionCountMap.set(input.playerId, playerActionCountMap.get(input.playerId) + 1)
    //   } else {
    //     playerActionCountMap.set(input.playerId, 1)
    //   }
    // }
    // for (const [playerId, actionCount] of playerActionCountMap) {
    //   if (this.playerApsMap.has(playerId)) {
    //     this.playerApsMap.get(playerId).update((1000 / msSinceLastTick) * actionCount)
    //   } else {
    //     this.playerApsMap.set(playerId, new SmoothDiagnostic(0.99, 0))
    //   }
    // }
    // const playersThatHadNoActions =
    //         Array.from(this.playerApsMap.keys())
    //           .filter(playerId => !Array.from(playerActionCountMap.keys()).includes(playerId))
    // playersThatHadNoActions.forEach(playerId => {
    //   this.playerApsMap.get(playerId).update(0)
    // })
  }

  // right now pub/sub only for diagnostics but could make game state engine subscribe
  registerSubscription (subscription) {
    this.subscriptions.push(subscription)
  }

  publish (diagnostics) {
    this.subscriptions.forEach(subscription => {
      subscription(diagnostics)
    })
  }
}