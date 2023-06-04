module.exports = class ServerSocketController {
  webSocket

  constructor(webSocket, connectionId, gameStateManager, serverGameEngine, socketControllersMap) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.webSocket = webSocket
    this.connectionId = connectionId
    this.gameStateManager = gameStateManager
    this.serverGameEngine = serverGameEngine
    this.socketControllersMap = socketControllersMap

    this.logger(`Connection established: ${this.connectionId}.`)

    this.gameStateManager.addPlayer(this.connectionId)

    // publish gameState updates to client
    this.gameStateManager.registerSubscription((gameState, clientPingTsMap) => {
      this.webSocket.send(JSON.stringify({
        type: 'game-state-update',
        value: gameState,
        clientPingTs: clientPingTsMap.get(this.connectionId)
      }))
    })

    // publish diagnostics updates to client
    this.serverGameEngine.registerSubscription((diagnostics) => {
      this.webSocket.send(JSON.stringify({
        type: 'diagnostics-update',
        value: {
          ...diagnostics,
          aps: diagnostics.aps[this.connectionId]
        }
      }))
    })

    // enqueue game input from client
    this.webSocket.on('message', dataBuffer => {
      const data = dataBuffer.toString('utf8')
      const input = JSON.parse(data)
      input.playerId = this.connectionId
      input.timestamp = Date.now()
      this.gameStateManager.inputQueue.push(input)
    })

    // handling what to do when clients disconnect from server
    this.webSocket.on('close', () => {
      this.gameStateManager.removePlayer(this.connectionId)
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
