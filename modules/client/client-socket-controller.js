const config = require('../shared/config.js')
const SmoothDiagnostic = require('../shared/util/smooth-diagnostic.js')
const PlayerInputMessage = require('../shared/models/socket-message/player-input-message.model')
const PingMessage = require('../shared/models/socket-message/ping-message.model')
const GameStateUpdateMessage = require('../shared/models/socket-message/game-state-update-message.model')

/**
 * Handles communication with the game server via websocket connection
 */
module.exports = class ClientSocketController {
  constructor (clientGameEngine, gameStateManager, playerInputController, liveDiagnostics) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.clientGameEngine = clientGameEngine
    this.gameStateManager = gameStateManager
    this.playerInputController = playerInputController
    this.liveDiagnostics = liveDiagnostics

    this.webSocket = undefined
    this.pingSD = new SmoothDiagnostic(0.1, 0)

    this.lastGameStateUpdate = Date.now()
    this.upsSD = new SmoothDiagnostic(0.95, 10)
  }

  connect () {
    this.logger(`Attempting to connect to server. (${config.gameServerSocketUrl})`)
    this.webSocket = new WebSocket(config.gameServerSocketUrl) // eslint-disable-line no-undef

    this.webSocket.addEventListener('open', this.onOpen.bind(this))
    this.webSocket.addEventListener('message', this.onMessage.bind(this))
    this.webSocket.addEventListener('error', this.onError.bind(this))

    // subscribe to the player input controller to send player input to the game-server
    this.playerInputController.registerSubscription((playerInput) => {
      this.webSocket.send(JSON.stringify(new PlayerInputMessage({ playerInput })))
    })
  }

  // handle successful connection
  onOpen (event) {
    this.logger('Successfully connected to the game-server.')
    this.clientGameEngine.start()
    this.doPing()
  }

  // handle incoming messages from the game-server
  onMessage (event) {
    this.clientGameEngine.newUpdates++
    const message = JSON.parse(event.data)

    if (message.messageType === GameStateUpdateMessage.name) {
      this.gameStateManager.gameState = message.gameState
      this.upsSD.update(1000 / (Date.now() - this.lastGameStateUpdate))
      this.liveDiagnostics.ups = Math.floor(this.upsSD.smoothValue)
      this.lastGameStateUpdate = Date.now()
    }

    if (message.messageType === PingMessage.name) {
      this.pingSD.update(Date.now() - message.startTimestamp)
      this.liveDiagnostics.ping = Math.floor(this.pingSD.smoothValue)
    }

    // if (serverUpdate.type === 'diagnostics-update') {
    //   if (serverUpdate.value.tps !== undefined) {
    //     this.liveDiagnostics.tps = serverUpdate.value.tps
    //   }
    //   if (serverUpdate.value.ticks !== undefined) {
    //     this.liveDiagnostics.ticks = serverUpdate.value.ticks
    //   }
    //   if (serverUpdate.value.aps !== undefined) {
    //     this.liveDiagnostics.aps = serverUpdate.value.aps
    //   }
    // }
  }

  // handle error establishing connection
  onError (event) {
    this.logger('Could not connect to the game-server. Next attempt in 1 second.')
    setTimeout(_ => this.connect(), 1000) // try again in 1 second
  }

  doPing() {
    this.webSocket.send(JSON.stringify(new PingMessage({ startTimestamp: Date.now() })))
    setTimeout(this.doPing.bind(this), 1000)
  }
}
