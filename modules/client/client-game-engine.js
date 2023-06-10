const SmoothDiagnostic = require('../shared/util/smooth-diagnostic.js')

/**
 * TODO: esplain this is the thing that drives the client, what it's responsible for
 */
module.exports = class ClientGameEngine {
  constructor ({
    gameStateMutator,
    renderer,
    liveDiagnostics
  } = {}) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.gameStateMutator = gameStateMutator
    this.renderer = renderer
    this.liveDiagnostics = liveDiagnostics

    this.kill = false

    this.previousFrameTs = Date.now()
    this.frame = 0
    this.fpsSD = new SmoothDiagnostic(0.99, 10)
  }

  start () {
    this.logger('Client game engine started.')
    window.requestAnimationFrame(this.gameLoop.bind(this))
  }

  stop() {
    this.kill = true
  }

  gameLoop () {
    if (this.kill) {
      return
    }
    this.frame++
    const now = Date.now()
    this.updateFps(now, this.previousFrameTs)
    this.previousFrameTs = now

    this.update()

    this.draw()

    window.requestAnimationFrame(this.gameLoop.bind(this))
  }

  update () {
    // TODO - implement predictive state updates
  }

  draw () {
    this.liveDiagnostics.frames = this.frame
    this.liveDiagnostics.fps = Math.floor(this.fpsSD.smoothValue)
    this.renderer.render(this.gameStateMutator.gameState)
  }

  updateFps (currentFrameTs, previousFrameTs) {
    const currentFps = 1000 / (currentFrameTs - previousFrameTs)
    this.fpsSD.update(currentFps)
  }
}
