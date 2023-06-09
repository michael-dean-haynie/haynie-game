const config = require('../shared/config.js')
const SmoothDiagnostic = require('../shared/util/smooth-diagnostic.js')
const PlayerInputMessage = require('../shared/models/socket-message/player-input-message.model')
const PingMessage = require('../shared/models/socket-message/ping-message.model')
const MutationStoreUpdateMessage = require('../shared/models/socket-message/mutation-store-update-message.model')

/**
 * Handles communication with the game server via websocket connection
 */
module.exports = class ClientSocketController {
  constructor (clientGameEngine, gameStateMutator, playerInputController, liveDiagnostics) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.clientGameEngine = clientGameEngine
    this.gameStateMutator = gameStateMutator
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

    if (message.messageType === MutationStoreUpdateMessage.name) {
      const updateMessage = new MutationStoreUpdateMessage(message)
      this.gameStateMutator.mutationStore.addRange(updateMessage.tick, updateMessage.mutations)
      this.gameStateMutator.stepForwardTillEnd()

      this.upsSD.update(1000 / (Date.now() - this.lastGameStateUpdate))
      this.liveDiagnostics.ups = Math.floor(this.upsSD.smoothValue)
      this.lastGameStateUpdate = Date.now()
    }

    if (message.messageType === PingMessage.name) {
      const pingMessage = new PingMessage(message)
      this.pingSD.update(Date.now() - pingMessage.startTimestamp)
      this.liveDiagnostics.ping = Math.floor(this.pingSD.smoothValue)
      this.liveDiagnostics.apm = pingMessage.apm
      this.liveDiagnostics.tps = pingMessage.tps
    }
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
