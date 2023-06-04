const ClientGameEngine = require('./modules/game-client/client-game-engine.js')
const PlayerInputController = require('./modules/game-client/player-input-controller.js')
const GameStateEngine = require('./modules/shared/game-state-engine.js')
const RenderingEngine = require('./modules/game-client/rendering-engine.js')
const SmoothDiagnostic = require('./modules/shared/util/smooth-diagnostic.js')
const logger = require('./modules/shared/util/logger.js')('client')
const config = require('./modules/shared/config.js')


const gameStateEngine = new GameStateEngine()
const renderingEngine = new RenderingEngine(document.getElementById('canvas'))
const clientGameEngine = new ClientGameEngine(gameStateEngine, renderingEngine)
const ping = new SmoothDiagnostic(0.99, 10)

let ws
connectToServer()

function connectToServer () {
  logger(`Attempting to connect to server. (${config.gameServerSocketUrl})`)
  ws = new WebSocket(config.gameServerSocketUrl) // eslint-disable-line no-undef

  // handle errors
  ws.addEventListener('error', (event) => {
    logger('Could not connect to the game-server. Next attempt in 1 second.')
    setTimeout(_ => connectToServer(), 1000) // try again in 1 second
  })

  // handle successful connection
  ws.addEventListener('open', () => {
    logger('Successfully connected to the game-server.')
    clientGameEngine.start()
  })

  // handle incoming messages from the game-server
  ws.addEventListener('message', function (event) {
    const serverUpdate = JSON.parse(event.data)
    clientGameEngine.newUpdates++
    if (serverUpdate.type === 'game-state-update') {
      gameStateEngine.gameState = serverUpdate.value
      if (serverUpdate.clientPingTs !== undefined) {
        ping.update(Date.now() - serverUpdate.clientPingTs)
        renderingEngine.diagnostics.ping = Math.floor(ping.smoothValue)
      }
    }

    if (serverUpdate.type === 'diagnostics-update') {
      if (serverUpdate.value.tps !== undefined) {
        renderingEngine.diagnostics.tps = serverUpdate.value.tps
      }
      if (serverUpdate.value.ticks !== undefined) {
        renderingEngine.diagnostics.ticks = serverUpdate.value.ticks
      }
      if (serverUpdate.value.aps !== undefined) {
        renderingEngine.diagnostics.aps = serverUpdate.value.aps
      }
    }
  })

  const playerInputController = new PlayerInputController()
  playerInputController.registerSubscription((playerInput) => {
    ws.send(JSON.stringify({
      ...playerInput,
      clientPingTs: Date.now()
    }))
  })
}
