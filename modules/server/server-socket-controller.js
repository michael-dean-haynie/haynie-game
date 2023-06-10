const { v4: uuidv4 } = require('uuid')
const PlayerInputMessage = require('../shared/models/socket-message/player-input-message.model')
const MoveInput = require('../shared/models/player-input/move-input.model')
const PingMessage = require('../shared/models/socket-message/ping-message.model')
const SmoothDiagnostic = require('../shared/util/smooth-diagnostic')
const PlayerInput = require('../shared/models/player-input/player-input')
const MutationStoreUpdateMessage = require('../shared/models/socket-message/mutation-store-update-message.model')
const JoinInput = require('../shared/models/player-input/join-input.model')
const ExitInput = require('../shared/models/player-input/exit-input.model')
const NewGameMessage = require('../shared/models/socket-message/new-game-message.model')
const MenuUpdateMessage = require('../shared/models/socket-message/menu-update-message.model')
const JoinGameMessage = require('../shared/models/socket-message/join-game-message.model')
const FastForwardMessage = require('../shared/models/socket-message/fast-forward-message.model')
module.exports = class ServerSocketController {
  lastPing = Date.now()
  inputsSinceLastPing = 0
  apmSD = new SmoothDiagnostic(0.75, 3)
  serverGameEngine = null
  mutationStoreSubKey = null

  constructor ({
    webSocket,
    connectionId,
    socketControllersMap,
    activeGameStore
  } = {}) {
    this.logger = require('../shared/util/logger.js')(this.constructor.name)
    this.webSocket = webSocket
    this.connectionId = connectionId
    this.socketControllersMap = socketControllersMap
    this.activeGameStore = activeGameStore

    this.logger(`Connection established: ${this.connectionId}.`)

    // push activeGameStore updates to client
    this.activeGameStore.subscribe((activeGamesMap) => {
      this.webSocket.send(JSON.stringify(new MenuUpdateMessage({
        gameKeys: [...activeGamesMap.keys()]
      })))
    })
    this.activeGameStore.publish()

    // process input from client
    this.webSocket.on('message', dataBuffer => {
      const data = dataBuffer.toString('utf8')
      const message = JSON.parse(data)

      // handle new-game message
      if (message.messageType === NewGameMessage.name) {
        this.joinNewGame()
      }

      // handle join-game message
      if (message.messageType === JoinGameMessage.name) {
        const joinGameMessage = new JoinGameMessage(message)
        this.joinGame(joinGameMessage.gameKey)
      }

      // handle player input messages
      if (message.messageType === PlayerInputMessage.name) {
        const playerInput = new PlayerInput(message.playerInput)
        this.handlePlayerInputMessage(playerInput)
      }

      // respond to ping with other server-side diagnostics included too
      if (message.messageType === PingMessage.name) {
        this.handlePingMessage(message)
      }
    })

    // handling what to do when clients disconnect from server
    this.webSocket.on('close', () => {
      if (this.serverGameEngine){
        this.serverGameEngine.gameStateMutationFactory.inputQueue.push(new ExitInput({ playerId: connectionId }))
      }
      this.socketControllersMap.delete(this.connectionId)
      this.logger(`Connection closed: ${this.connectionId}.`)
    })

    // handling socket error
    this.webSocket.onerror = function (error) {
      this.logger('Unexpected socket error: %', error)
      throw error
    }
  }

  joinNewGame() {
    const serverGameEngine = this.activeGameStore.initializeNewGame()
    const gameKey = uuidv4()
    this.activeGameStore.add(gameKey, serverGameEngine)

    this.joinGame(gameKey)
  }

  joinGame(gameKey) {
    this.serverGameEngine = this.activeGameStore.get(gameKey)
    this.sendClientFastForwardData()
    this.mutationStoreSubKey =
      this.serverGameEngine.gameStateMutator.mutationStore.subscribe(this.handleMutationStoreUpdates.bind(this))

    this.serverGameEngine.gameStateMutationFactory.inputQueue.push(new JoinInput({ playerId: this.connectionId }))
  }

  sendClientFastForwardData() {
    const tickTuples = [...this.serverGameEngine.gameStateMutator.mutationStore.mutationsByTick.entries()]
    this.webSocket.send(JSON.stringify(new FastForwardMessage({ tickTuples })))
  }

  handleMutationStoreUpdates(tick, mutations) {
    this.webSocket.send(JSON.stringify(new MutationStoreUpdateMessage({ tick, mutations })))
  }

  handlePlayerInputMessage(playerInput) {
    playerInput.playerId = this.connectionId

    // diagnostics
    this.inputsSinceLastPing++

    // move input
    if (playerInput.inputType === MoveInput.name) {
      const moveInput = new MoveInput(playerInput)
      this.serverGameEngine.gameStateMutationFactory.inputQueue.push(moveInput)
    }

    // exit game input
    if (playerInput.inputType === ExitInput.name) {
      const exitInput = new ExitInput(playerInput)
      this.serverGameEngine.gameStateMutationFactory.inputQueue.push(exitInput)
      this.serverGameEngine.gameStateMutator.mutationStore.unsubscribe(this.mutationStoreSubKey)
      this.serverGameEngine = null
    }
  }

  handlePingMessage(message) {
    const msSinceLastPing = Date.now() - this.lastPing
    this.lastPing = Date.now()
    const sSinceLastPing = msSinceLastPing / 1000
    const mSinceLastPing = sSinceLastPing / 60
    const avgApmSinceLastPing = this.inputsSinceLastPing / mSinceLastPing
    this.apmSD.update(avgApmSinceLastPing)
    this.inputsSinceLastPing = 0

    this.webSocket.send(JSON.stringify(new PingMessage( {
      ...message,
      apm: Math.floor(this.apmSD.smoothValue),
      tps: this.serverGameEngine.liveDiagnostics.tps
    })))
  }
}
