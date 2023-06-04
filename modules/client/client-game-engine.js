const SmoothDiagnostic = require('../shared/util/smooth-diagnostic.js')

/**
 * TODO: esplain this is the thing that drives the client, what it's responsible for
 */
module.exports = class ClientGameEngine {
  constructor (gameStateManager, renderer, liveDiagnostics) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.gameStateManager = gameStateManager
    this.renderer = renderer
    this.liveDiagnostics = liveDiagnostics

    this.previousFrameTs = Date.now()
    this.frame = 0
    this.fpsSD = new SmoothDiagnostic(0.99, 10)
    this.newUpdates = 0
    this.upsSD = new SmoothDiagnostic(0.99, 10)
  }

  start () {
    this.logger('Client game engine started.')
    window.requestAnimationFrame(this.gameLoop.bind(this))
  }

  gameLoop () {
    this.frame++
    const now = Date.now()
    this.updateFps(now, this.previousFrameTs)
    this.updateUps(now, this.previousFrameTs)
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
    this.liveDiagnostics.ups = Math.floor(this.upsSD.smoothValue)
    this.renderer.render(this.gameStateManager.gameState)
  }

  updateFps (currentFrameTs, previousFrameTs) {
    const currentFps = 1000 / (currentFrameTs - previousFrameTs)
    this.fpsSD.update(currentFps)
  }

  updateUps (currentFrameTs, previousFrameTs) {
    this.upsSD.update((1000 / (currentFrameTs - previousFrameTs)) * this.newUpdates)
    this.newUpdates = 0
  }
}
