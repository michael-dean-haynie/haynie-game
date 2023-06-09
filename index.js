const LiveDiagnostics = require('./modules/client/live-diagnostics.js')
const Renderer = require('./modules/client/renderer.js')
const ClientGameEngine = require('./modules/client/client-game-engine.js')
const PlayerInputController = require('./modules/client/player-input-controller.js')
const ClientSocketController = require('./modules/client/client-socket-controller.js')
const GameState = require('./modules/shared/models/game-state/game-state.model')
const MutationStore = require('./modules/shared/mutation-store')
const GameStateMutator = require('./modules/shared/game-state-mutator')

// initialize components
const gameState = new GameState()
const mutationStore = new MutationStore()
const gameStateMutator = new GameStateMutator({ gameState, mutationStore })
const liveDiagnostics = new LiveDiagnostics()
const renderer = new Renderer(document.getElementById('canvas'), liveDiagnostics)
const clientGameEngine = new ClientGameEngine(gameStateMutator, renderer, liveDiagnostics)
const playerInputController = new PlayerInputController()
const clientSocketController = new ClientSocketController(
  clientGameEngine,
  gameStateMutator,
  playerInputController,
  liveDiagnostics
)

// start
clientSocketController.connect()
