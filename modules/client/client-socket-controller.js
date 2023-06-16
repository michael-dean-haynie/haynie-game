const config = require('../shared/config.js')
const SmoothDiagnostic = require('../shared/util/smooth-diagnostic.js')
const PlayerInputMessage = require('../shared/models/socket-message/player-input-message.model')
const PingMessage = require('../shared/models/socket-message/ping-message.model')
const MutationStoreUpdateMessage = require('../shared/models/socket-message/mutation-store-update-message.model')
const MenuUpdateMessage = require('../shared/models/socket-message/menu-update-message.model')
const NewGameMessage = require('../shared/models/socket-message/new-game-message.model')
const JoinGameMessage = require('../shared/models/socket-message/join-game-message.model')
const FastForwardMessage = require('../shared/models/socket-message/fast-forward-message.model')
const ClientGameEngine = require('./client-game-engine')
const GameStateMutator = require('../shared/game-state-mutator')
const GameState = require('../shared/models/game-state/game-state.model')
const MutationStore = require('../shared/mutation-store')
const LiveDiagnostics = require('./live-diagnostics')
const Renderer = require('./renderer')
const ExitInput = require('../shared/models/player-input/exit-input.model')

/**
 * Handles communication with the game server via websocket connection
 */
module.exports = class ClientSocketController {
  clientGameEngine = null

  constructor ({
    playerInputController,
    menuController,
  } = {}) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.playerInputController = playerInputController
    this.menuController = menuController

    this.webSocket = undefined
    this.pingSD = new SmoothDiagnostic(0.1, 0)

    this.lastGameStateUpdate = Date.now()
    this.upsSD = new SmoothDiagnostic(0.95, 10)
  }

  connect () {
    this.logger(`Attempting to connect to server. (${config.gameServerSocketUrl})`)
    this.webSocket = new WebSocket(config.gameServerSocketUrl) // eslint-disable-line no-undef

    this.webSocket.addEventListener('open', this.onOpen.bind(this))
    this.webSocket.addEventListener('message', this.onMessage.bind(this))
    this.webSocket.addEventListener('error', this.onError.bind(this))

    // subscribe to the player input controller to send player input to the game-server
    this.playerInputController.registerSubscription((playerInput) => {
      if (this.clientGameEngine) {
        this.webSocket.send(JSON.stringify(new PlayerInputMessage({ playerInput })))
      }
    })

    // subscribe to the menu controller to send newGame / joinGame / exitGame info to the game-server
    this.menuController.subscribe('newGame', () => {
      this.webSocket.send(JSON.stringify(new NewGameMessage()))
      this.clientGameEngine = this.initNewEngine()
      this.clientGameEngine.start()
      this.menuController.hideMenu()
      this.menuController.showCanvas()
      this.menuController.showInGameMenu()
    })
    this.menuController.subscribe('joinGame', (gameKey) => {
      this.webSocket.send(JSON.stringify(new JoinGameMessage({ gameKey })))
      this.clientGameEngine = this.initNewEngine()
      this.clientGameEngine.start()
      this.menuController.hideMenu()
      this.menuController.showCanvas()
      this.menuController.showInGameMenu()
    })
    this.menuController.subscribe('exitGame', () => {
      const playerInput = new ExitInput()
      this.webSocket.send(JSON.stringify(new PlayerInputMessage({ playerInput })))

      // break game-state model object references
     //  const newMutationsByTick = new Map()
     //  for (let [tick, mutations] of [...this.clientGameEngine.gameStateMutator.mutationStore.mutationsByTick]) {
     //    newMutationsByTick.set(tick, JSON.parse(JSON.stringify(mutations)))
     //  }
     // this.clientGameEngine.gameStateMutator.mutationStore.mutationsByTick = newMutationsByTick
      this.menuController.replayData.push(this.clientGameEngine.gameStateMutator.mutationStore)
      this.menuController.refreshReplays()

      this.clientGameEngine.stop()
      this.clientGameEngine = null
      this.menuController.hideCanvas()
      this.menuController.hideInGameMenu()
      this.menuController.showMenu()

    })
  }

  // handle successful connection
  onOpen (event) {
    this.logger('Successfully connected to the game-server.')
    // TODO: re-enable this with game engine
    // this.doPing()
  }

  // handle incoming messages from the game-server
  onMessage (event) {
    const message = JSON.parse(event.data)

    if (message.messageType === MenuUpdateMessage.name) {
      const updateMessage = new MenuUpdateMessage(message)
      this.menuController.refreshMenu(updateMessage.gameKeys)
    }

    if (message.messageType === FastForwardMessage.name) {
      const ffMessage = new FastForwardMessage(message)
      for (let [ tick, mutations ] of ffMessage.tickTuples) {
        this.clientGameEngine.gameStateMutator.mutationStore.addRange(tick, mutations)
      }
      this.clientGameEngine.gameStateMutator.stepForwardTillEnd()
    }

    if (message.messageType === MutationStoreUpdateMessage.name) {
      const updateMessage = new MutationStoreUpdateMessage(message)
      this.clientGameEngine.gameStateMutator.mutationStore.addRange(updateMessage.tick, updateMessage.mutations)
      this.clientGameEngine.gameStateMutator.stepForwardTillEnd()

      this.upsSD.update(1000 / (Date.now() - this.lastGameStateUpdate))
      this.clientGameEngine.liveDiagnostics.ups = Math.floor(this.upsSD.smoothValue)
      this.lastGameStateUpdate = Date.now()
    }

    if (message.messageType === PingMessage.name) {
      const pingMessage = new PingMessage(message)
      this.pingSD.update(Date.now() - pingMessage.startTimestamp)
      this.clientGameEngine.liveDiagnostics.ping = Math.floor(this.pingSD.smoothValue)
      this.clientGameEngine.liveDiagnostics.apm = pingMessage.apm
      this.clientGameEngine.liveDiagnostics.tps = pingMessage.tps
    }
  }

  // handle error establishing connection
  onError (event) {
    this.logger('Could not connect to the game-server. Next attempt in 1 second.')
    setTimeout(_ => this.connect(), 1000) // try again in 1 second
  }

  doPing() {
    this.webSocket.send(JSON.stringify(new PingMessage({ startTimestamp: Date.now() })))
    setTimeout(this.doPing.bind(this), 1000)
  }

  initNewEngine() {
    const gameState = new GameState()
    const mutationStore = new MutationStore()
    const gameStateMutator = new GameStateMutator({
      gameState,
      mutationStore
    })
    const liveDiagnostics = new LiveDiagnostics()
    const renderer = new Renderer(document.getElementById('canvas'), liveDiagnostics)
    const clientGameEngine = new ClientGameEngine({
      gameStateMutator,
      renderer,
      liveDiagnostics
    })

    return clientGameEngine
  }
}
