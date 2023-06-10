const GameState = require('../shared/models/game-state/game-state.model')
const config = require('../shared/config.js')
const MutationStore = require('../shared/mutation-store')
const GameStateMutator = require('../shared/game-state-mutator')
const LiveDiagnostics = require('../client/live-diagnostics')
const ServerGameEngine = require('./server-game-engine')
const GameStateMutationFactory = require('../shared/game-state-mutation-factory')

module.exports = class ActiveGameStore {
  constructor() {
    this.activeGamesMap = new Map()
    this.subscriptions = []
  }

  add(key, gameServerEngine) {
    this.activeGamesMap.set(key, gameServerEngine)
    this.publish()
  }

  remove(key) {
    this.activeGamesMap.delete(key)
    this.publish()
  }

  get(key) {
    return this.activeGamesMap.get(key)
  }

  subscribe(subscription) {
    this.subscriptions.push(subscription)
  }

  publish() {
    this.subscriptions.forEach(subscription => {
      subscription(this.activeGamesMap)
    })
  }

  initializeNewGame() {
    const gameState = new GameState({
      gameHeight: config.gameHeight,
      gameWidth: config.gameWidth
    })
    const gameStateMutationFactory = new GameStateMutationFactory({ gameState })
    const mutationStore = new MutationStore()
    const gameStateMutator = new GameStateMutator({ gameState, mutationStore })
    const liveDiagnostics = new LiveDiagnostics()
    const serverGameEngine = new ServerGameEngine({
      gameStateMutationFactory,
      gameStateMutator,
      liveDiagnostics
    })

    serverGameEngine.start()
    return serverGameEngine
  }
}

