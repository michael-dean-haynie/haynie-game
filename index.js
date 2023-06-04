const ClientGameEngine = require('./modules/client/client-game-engine.js')
const GameStateManager = require('./modules/shared/game-state-manager.js')
const Renderer = require('./modules/client/renderer.js')
const ClientSocketController = require('./modules/client/client-socket-controller.js')
const PlayerInputController = require('./modules/client/player-input-controller.js')
const LiveDiagnostics = require('./modules/client/live-diagnostics.js')

const gameStateManager = new GameStateManager()
const liveDiagnostics = new LiveDiagnostics()
const renderer = new Renderer(document.getElementById('canvas'), liveDiagnostics)
const clientGameEngine = new ClientGameEngine(gameStateManager, renderer, liveDiagnostics)
const playerInputController = new PlayerInputController()
const clientSocketController = new ClientSocketController(
  clientGameEngine,
  gameStateManager,
  playerInputController,
  liveDiagnostics
)

clientSocketController.connect()
