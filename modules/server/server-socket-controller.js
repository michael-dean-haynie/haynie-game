const PlayerInputMessage = require('../shared/models/socket-message/player-input-message.model')
const MoveInput = require('../shared/models/player-input/move-input.model')
const PingMessage = require('../shared/models/socket-message/ping-message.model')
const GameStateUpdateMessage = require('../shared/models/socket-message/game-state-update-message.model')
const SmoothDiagnostic = require('../shared/util/smooth-diagnostic')
module.exports = class ServerSocketController {
  webSocket
  lastPing = Date.now()
  inputsSinceLastPing = 0
  apmSD = new SmoothDiagnostic(0.75, 3)

  constructor (webSocket, connectionId, gameStateManager, socketControllersMap, liveDiagnostics) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.webSocket = webSocket
    this.connectionId = connectionId
    this.gameStateManager = gameStateManager
    this.socketControllersMap = socketControllersMap
    this.liveDiagnostics = liveDiagnostics

    this.logger(`Connection established: ${this.connectionId}.`)

    this.gameStateManager.gameEventFactory.createPlayerJoinedEvent(this.connectionId)

    // publish gameState updates to client
    this.gameStateManager.registerSubscription((gameState) => {
      this.webSocket.send(JSON.stringify(new GameStateUpdateMessage({ gameState })))
    })

    // process input from client
    this.webSocket.on('message', dataBuffer => {
      const data = dataBuffer.toString('utf8')
      const message = JSON.parse(data)

      // handle player input messages
      if (message.messageType === PlayerInputMessage.name) {
        const input = message.playerInput
        input.playerId = this.connectionId
        input.timestamp = Date.now()

        // diagnostics
        this.inputsSinceLastPing++

        // event factory
        if (input.inputType === MoveInput.name) {
          this.gameStateManager.gameEventFactory.createPlayerVectorChangedEvent(this.connectionId, input.direction)
        }
      }

      // respond to ping with other server-side diagnostics included too
      if (message.messageType === PingMessage.name) {
        const msSinceLastPing = Date.now() - this.lastPing
        this.lastPing = Date.now()
        const sSinceLastPing = msSinceLastPing / 1000
        const mSinceLastPing = sSinceLastPing / 60
        const avgApmSinceLastPing = this.inputsSinceLastPing / mSinceLastPing
        this.apmSD.update(avgApmSinceLastPing)
        this.inputsSinceLastPing = 0

        this.webSocket.send(JSON.stringify(new PingMessage( {
          ...message,
          apm: Math.floor(this.apmSD.smoothValue),
          tps: this.liveDiagnostics.tps
        })))
      }
    })

    // handling what to do when clients disconnect from server
    this.webSocket.on('close', () => {
      this.gameStateManager.gameEventFactory.createPlayerLeftEvent(this.connectionId)
      this.socketControllersMap.delete(this.connectionId)
      this.logger(`Connection closed: ${this.connectionId}.`)
    })

    // handling socket error
    this.webSocket.onerror = function (error) {
      this.logger('Unexpected socket error: %', error)
      throw error
    }
  }
}
