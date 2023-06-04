const ServerSocketController = require('./modules/server/server-socket-controller.js')
const ServerGameEngine = require('./modules/server/server-game-engine.js')
const GameStateManager = require('./modules/shared/game-state-manager.js')
const { v4: uuidv4 } = require('uuid')
const WebSocket = require('ws')
const logger = require('./modules/shared/util/logger.js')('server')
const config = require('./modules/shared/config.js')

// initialize components
const gameStateManager = new GameStateManager()
const serverGameEngine = new ServerGameEngine(gameStateManager)

// Creating a new websocket server
const socketControllersMap = new Map()
const wss = new WebSocket.WebSocketServer({ port: config.gameServerSocketPort })
logger(`Game server started. (port=${config.gameServerSocketPort})`)

// handle new incoming connection
wss.on('connection', ws => {
  const connectionId = uuidv4()
  const controller = new ServerSocketController(
    ws,
    connectionId,
    gameStateManager,
    serverGameEngine,
    socketControllersMap
  )
  socketControllersMap.set(connectionId, controller)
})

// Start the game engine
serverGameEngine.start()
