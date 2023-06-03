const Logger = require('./modules/shared/util/logger.js')
const ServerGameEngine = require('./modules/game-server/server-game-engine.js')
const GameStateEngine = require('./modules/shared/game-state-engine.js')
const { v4: uuidv4 } = require('uuid')
const WebSocket = require('ws')

const gameStateEngine = new GameStateEngine()
const serverGameEngine = new ServerGameEngine(gameStateEngine)

// Creating a new websocket server
const connections = new Map()
const wss = new WebSocket.WebSocketServer({ port: 8070 })

wss.on('connection', ws => {
  const connection = ws
  const connectionId = uuidv4()
  connections.set(connectionId, connection)
  gameStateEngine.addPlayer(connectionId)

  // publish gameState updates to client
  gameStateEngine.registerSubscription((gameState, clientPingTsMap) => {
    ws.send(JSON.stringify({
      type: 'game-state-update',
      value: gameState,
      clientPingTs: clientPingTsMap.get(connectionId)
    }))
  })

  // publish diagnostics updates to client
  serverGameEngine.registerSubscription((diagnostics) => {
    ws.send(JSON.stringify({
      type: 'diagnostics-update',
      value: {
        ...diagnostics,
        aps: diagnostics.aps[connectionId]
      }
    }))
  })

  // enqueue game input from client
  ws.on('message', dataBuffer => {
    const data = dataBuffer.toString('utf8')
    const input = JSON.parse(data)
    input.playerId = connectionId
    input.timestamp = Date.now()
    gameStateEngine.inputQueue.push(input)
  })

  // handling what to do when clients disconnect from server
  ws.on('close', () => {
    Logger.info('The client has disconnected')
    gameStateEngine.removePlayer(connectionId)
    connections.delete(connectionId)
  })

  // handling client connection error
  ws.onerror = function () {
    Logger.error('Some Error occurred')
  }
})

Logger.info('Server has started.')

serverGameEngine.start()
