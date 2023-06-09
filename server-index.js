const ServerSocketController = require('./modules/server/server-socket-controller.js')
const ServerGameEngine = require('./modules/server/server-game-engine.js')
const { v4: uuidv4 } = require('uuid')
const WebSocket = require('ws')
const logger = require('./modules/shared/util/logger.js')('server')
const config = require('./modules/shared/config.js')
const GameState = require('./modules/shared/models/game-state/game-state.model')
const LiveDiagnostics = require('./modules/client/live-diagnostics')
const GameStateMutationFactory = require('./modules/shared/game-state-mutation-factory')
const MutationStore = require('./modules/shared/mutation-store')
const GameStateMutator = require('./modules/shared/game-state-mutator')

// initialize components
const gameState = new GameState({
  gameHeight: config.gameHeight,
  gameWidth: config.gameWidth,
  players: []
})
const gameStateMutationFactory = new GameStateMutationFactory(gameState)
const mutationStore = new MutationStore()
const gameStateMutator = new GameStateMutator({ gameState, mutationStore })
const liveDiagnostics = new LiveDiagnostics()
const serverGameEngine = new ServerGameEngine(gameStateMutationFactory, gameStateMutator, liveDiagnostics)

// Creating a new websocket server
const socketControllersMap = new Map()
const wss = new WebSocket.WebSocketServer({ port: config.gameServerSocketPort })
logger(`Game server started. (port=${config.gameServerSocketPort})`)

// handle new incoming connection
wss.on('connection', ws => {
  const connectionId = uuidv4()
  const controller = new ServerSocketController({
    webSocket: ws,
    connectionId,
    gameStateMutationFactory,
    gameStateMutator,
    socketControllersMap,
    liveDiagnostics
  })
  socketControllersMap.set(connectionId, controller)
})

// Start the game engine
serverGameEngine.start()
