const PlayerInputController = require('./modules/client/player-input-controller.js')
const ClientSocketController = require('./modules/client/client-socket-controller.js')
const MenuController = require('./modules/client/menu-controller')

// initialize components
const playerInputController = new PlayerInputController()
const menuController = new MenuController()
const clientSocketController = new ClientSocketController({
  playerInputController,
  menuController,
})

// start
clientSocketController.connect()
