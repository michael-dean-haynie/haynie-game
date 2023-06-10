const ServerSocketController = require('./modules/server/server-socket-controller.js')
const { v4: uuidv4 } = require('uuid')
const WebSocket = require('ws')
const logger = require('./modules/shared/util/logger.js')('server')
const config = require('./modules/shared/config.js')
const ActiveGameStore = require('./modules/server/active-game-store')

// Creating a new websocket server
const activeGameStore = new ActiveGameStore()
const socketControllersMap = new Map()
const wss = new WebSocket.WebSocketServer({ port: config.gameServerSocketPort })
logger(`Game server started. (port=${config.gameServerSocketPort})`)

// handle new incoming connection
wss.on('connection', ws => {
  const connectionId = uuidv4()
  const controller = new ServerSocketController({
    webSocket: ws,
    connectionId,
    socketControllersMap,
    activeGameStore
  })
  socketControllersMap.set(connectionId, controller)
})
