const config = require('./config')
const GameState = require('./models/game-state/game-state.model')
const NewGameStateManager = require('./new-game-state-manager.js')
const GameEventFactory = require('./game-event-factory')
const { v4: uuidv4 } = require('uuid')

test('test name', () => {
  const gameState = new GameState({
    gameHeight: config.gameHeight,
    gameWidth: config.gameWidth
  })
  const gameEventFactory = new GameEventFactory(gameState)
  const stateManager = new NewGameStateManager({ gameState })

  const playerId = uuidv4()
  stateManager.gameEventStore.add(1, gameEventFactory.createGameStartEvent())
  stateManager.stepForward()
  stateManager.gameEventStore.add(2, gameEventFactory.createPlayerJoinedEvent(playerId))
  stateManager.stepForward()
  stateManager.stepForward()
  stateManager.stepForward()
  stateManager.gameEventStore.add(5, gameEventFactory.createPlayerVectorChangedEvent(playerId, 'up'));
  stateManager.stepForward()
  stateManager.stepForward()
  stateManager.stepForward()
  stateManager.stepForward()
  stateManager.stepForward()
  stateManager.gameEventStore.add(10, gameEventFactory.createPlayerVectorChangedEvent(playerId, 'none'));
  stateManager.stepForward()
  stateManager.stepForward()
  stateManager.stepForward()
  stateManager.stepForward()
  stateManager.stepForward()
  stateManager.gameEventStore.add(15, gameEventFactory.createPlayerVectorChangedEvent(playerId, 'left'));
  stateManager.gameEventStore.add(15, gameEventFactory.createPlayerVectorChangedEvent(playerId, 'right'));
  stateManager.stepForward()

  while(gameState.tick >= 0) {
    stateManager.stepBackward()
  }


  expect(true).toBe(true)
})
