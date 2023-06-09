const PlayerInputMessage = require('../shared/models/socket-message/player-input-message.model')
const MoveInput = require('../shared/models/player-input/move-input.model')
const PingMessage = require('../shared/models/socket-message/ping-message.model')
const SmoothDiagnostic = require('../shared/util/smooth-diagnostic')
const PlayerInput = require('../shared/models/player-input/player-input')
const MutationStoreUpdateMessage = require('../shared/models/socket-message/mutation-store-update-message.model')
const JoinInput = require('../shared/models/player-input/join-input.model')
const ExitInput = require('../shared/models/player-input/exit-input.model')
module.exports = class ServerSocketController {
  lastPing = Date.now()
  inputsSinceLastPing = 0
  apmSD = new SmoothDiagnostic(0.75, 3)

  constructor ({
    webSocket,
    connectionId,
    gameStateMutationFactory,
    gameStateMutator,
    socketControllersMap,
    liveDiagnostics
  } = {}) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.webSocket = webSocket
    this.connectionId = connectionId
    this.gameStateMutationFactory = gameStateMutationFactory
    this.gameStateMutator = gameStateMutator
    this.socketControllersMap = socketControllersMap
    this.liveDiagnostics = liveDiagnostics

    this.logger(`Connection established: ${this.connectionId}.`)

    this.gameStateMutationFactory.inputQueue.push(new JoinInput({ playerId: connectionId }))

    // publish gameState updates to client
    this.gameStateMutator.mutationStore.subscribe((tick, mutations) => {
      this.webSocket.send(JSON.stringify(new MutationStoreUpdateMessage({ tick, mutations })))
    })

    // process input from client
    this.webSocket.on('message', dataBuffer => {
      const data = dataBuffer.toString('utf8')
      const message = JSON.parse(data)

      // handle player input messages
      if (message.messageType === PlayerInputMessage.name) {
        const playerInput = new PlayerInput(message.playerInput)
        playerInput.playerId = this.connectionId

        // diagnostics
        this.inputsSinceLastPing++

        // event factory
        if (playerInput.inputType === MoveInput.name) {
          const moveInput = new MoveInput(playerInput)
          this.gameStateMutationFactory.inputQueue.push(moveInput)
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
      // TODO: temp disabling
      this.gameStateMutationFactory.inputQueue.push(new ExitInput({ playerId: connectionId }))
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
