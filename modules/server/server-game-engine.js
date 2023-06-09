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
  constructor (gameStateMutationFactory, gameStateMutator, liveDiagnostics) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.gameStateMutationFactory = gameStateMutationFactory
    this.gameStateMutator = gameStateMutator
    this.liveDiagnostics = liveDiagnostics

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

    // diagnostics
    this.updateTps(msSinceLastTick)

    // actually do game stuff
    const currentTickTs = this.lastTickTs + msSinceLastTick
    // TODO: remove
    // this.gameStateManager.stepForward()

    const nextTick = this.ticks
    const mutationsForNextTick = this.gameStateMutationFactory.computeAndExecuteMutationsForNextTick()
    if (mutationsForNextTick.length){
      this.gameStateMutator.mutationStore.addRange(nextTick, mutationsForNextTick)
    }

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
    this.liveDiagnostics.tps = Math.floor(this.tpsSD.smoothValue)
  }
}
