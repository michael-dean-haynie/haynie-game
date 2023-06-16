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
    this.tickLengthMs = 1000 / 120 // keeping this high otherwise it will end up like twice as slow because request animation frame is like almost always 60fps

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
    this.logger('entering gameLoop()')
    if (this.paused) {
      return
    }
    const now = Date.now()
    const msSinceLastTick = now - this.lastTickTs

    if (msSinceLastTick >= this.tickLengthMs) {
      this.logger(`attempting tick [tick=${this.tick}]`)
      this.lastTickTs = now

      if (this.inRewind) {
        if (this.tick <= 0) {
          this.logger(`halting rewind at [tick=${this.tick}]`)
          return
        } else {
          this.gameStateMutator.stepBackward()
          this.tick--
          this.draw()
        }
      }
      if (!this.inRewind) {
        if (this.tick >= this.gameStateMutator.mutationStore.maxTick) {
          this.logger(`halting play at [tick=${this.tick}]`)
          return
        } else {
          this.gameStateMutator.stepForward()
          this.tick++
          this.draw()
        }
      }
    }
    else {
      this.logger(`not ticking this loop. [msSinceLastTick=${msSinceLastTick}]`);
    }

    window.requestAnimationFrame(this.gameLoop.bind(this))
  }

  draw () {
    this.renderer.render(this.gameStateMutator.gameState)
  }
}
