module.exports = class ClientReplayEngine {
  constructor ({
    gameStateMutator,
    renderer,
  } = {}) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.gameStateMutator = gameStateMutator
    this.renderer = renderer

    // Length of a tick in milliseconds. The denominator is your desired framerate.
    // e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps
    this.tickLengthMs = 1000 / 60

    this.paused = true
    this.inRewind = false

    this.lastTickTs = Date.now()
    this.tick = 0
  }

  play () {
    this.paused = false
    this.inRewind = false
    // this.logger('Client replay engine started.')
    window.requestAnimationFrame(this.gameLoop.bind(this))
  }

  pause() {
    this.paused = true
  }

  rewind() {
    this.paused = false
    this.inRewind = true
    window.requestAnimationFrame(this.gameLoop.bind(this))
  }

  gameLoop () {
    if (this.paused) {
      return
    }
    const now = Date.now()
    const msSinceLastTick = now - this.lastTickTs
    this.lastTickTs = now

    if (msSinceLastTick >= this.tickLengthMs) {
      if (this.inRewind && this.tick > 0) {
        this.gameStateMutator.stepBackward()
        this.tick--
      }
      if (!this.inRewind && this.gameStateMutator.mutationStore.maxTick >= this.tick){
        this.gameStateMutator.stepForward()
        this.tick++
      }
      this.draw()
    }

    window.requestAnimationFrame(this.gameLoop.bind(this))
  }

  draw () {
    this.renderer.render(this.gameStateMutator.gameState)
  }
}
