const PlayerInputMessage = require('../shared/models/socket-message/player-input-message.model')
const MoveInput = require('../shared/models/player-input/move-input.model')
const PingMessage = require('../shared/models/socket-message/ping-message.model')
const GameStateUpdateMessage = require('../shared/models/socket-message/game-state-update-message.model')
module.exports = class ServerSocketController {
  webSocket

  constructor (webSocket, connectionId, gameStateManager, serverGameEngine, socketControllersMap) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.webSocket = webSocket
    this.connectionId = connectionId
    this.gameStateManager = gameStateManager
    this.serverGameEngine = serverGameEngine
    this.socketControllersMap = socketControllersMap

    this.logger(`Connection established: ${this.connectionId}.`)

    this.gameStateManager.gameEventFactory.createPlayerJoinedEvent(this.connectionId)

    // publish gameState updates to client
    this.gameStateManager.registerSubscription((gameState) => {
      this.webSocket.send(JSON.stringify(new GameStateUpdateMessage({ gameState })))
    })

    // // publish diagnostics updates to client
    // this.serverGameEngine.registerSubscription((diagnostics) => {
    //   this.webSocket.send(JSON.stringify({
    //     type: 'diagnostics-update',
    //     value: {
    //       ...diagnostics,
    //       aps: diagnostics.aps[this.connectionId]
    //     }
    //   }))
    // })

    // process input from client
    this.webSocket.on('message', dataBuffer => {
      const data = dataBuffer.toString('utf8')
      const message = JSON.parse(data)

      // handle player input messages
      if (message.messageType === PlayerInputMessage.name) {
        const input = message.playerInput
        input.playerId = this.connectionId
        input.timestamp = Date.now()

        if (input.inputType === MoveInput.name) {
          this.gameStateManager.gameEventFactory.createPlayerVectorChangedEvent(this.connectionId, input.direction)
        }
      }

      if (message.messageType === PingMessage.name) {
        this.webSocket.send(JSON.stringify(message))
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
