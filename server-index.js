const ServerGameEngine = require('./modules/game-server/server-game-engine.js')
const GameStateEngine = require('./modules/shared/game-state-engine.js')
const { v4: uuidv4 } = require('uuid')
const WebSocket = require('ws')
const logger = require('./modules/shared/util/logger.js')('server')
const config = require('./modules/shared/config.js')

const gameStateEngine = new GameStateEngine()
const serverGameEngine = new ServerGameEngine(gameStateEngine)

// Creating a new websocket server
const connections = new Map()
const wss = new WebSocket.WebSocketServer({ port: config.gameServerSocketPort })
logger(`Game server started. (port=${config.gameServerSocketPort})`)

// handle new incoming connection
wss.on('connection', ws => {
  const connection = ws
  const connectionId = uuidv4()
  connections.set(connectionId, connection)
  logger(`Connection established: ${connectionId}.`)

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
    gameStateEngine.removePlayer(connectionId)
    connections.delete(connectionId)
    logger(`Connection closed: ${connectionId}.`)
  })

  // handling socket error
  ws.onerror = function (error) {
    logger('Unexpected socket error: %', error)
    throw error
  }
})

serverGameEngine.start()
