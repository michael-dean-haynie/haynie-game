const Logger = require('./modules/shared/util/logger.js')
const ClientGameEngine = require('./modules/game-client/client-game-engine.js')
const PlayerInputController = require('./modules/game-client/player-input-controller.js')
const GameStateEngine = require('./modules/shared/game-state-engine.js')
const RenderingEngine = require('./modules/game-client/rendering-engine.js')
const SmoothDiagnostic = require('./modules/shared/util/smooth-diagnostic.js')
const uuidv4 = require('uuid').v4

const gameStateEngine = new GameStateEngine()
const renderingEngine = new RenderingEngine(document.getElementById('canvas'))
const clientGameEngine = new ClientGameEngine(gameStateEngine, renderingEngine)
const ping = new SmoothDiagnostic(0.99, 10)

let ws
connectToServer()

function connectToServer () {
  console.log('npm package uuid works in browser:', uuidv4())
  console.log('Attempting to connect to server')
  ws = new WebSocket('ws://localhost:8070') // eslint-disable-line no-undef

  ws.addEventListener('error', (event) => {
    console.warn('Could not connect to server, trying again in 1 second...')
    // try again after 1 sec
    setTimeout(_ => connectToServer(), 1000)
  })

  ws.addEventListener('open', () => {
    Logger.info('Successfully connected to game server.')
    clientGameEngine.start()
  })

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
