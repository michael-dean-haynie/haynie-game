import { Logger } from "./modules/shared/util/logger.mjs";
import { ClientGameEngine } from "./modules/game-client/client-game-engine.mjs";
import { PlayerInputController } from "./modules/game-client/player-input-controller.mjs";
import {GameStateEngine} from "./modules/shared/game-state-engine.mjs";
import {RenderingEngine} from "./modules/game-client/rendering-engine.mjs";

const gameStateEngine = new GameStateEngine()
const renderingEngine = new RenderingEngine(document.getElementById('canvas'))
const clientGameEngine = new ClientGameEngine(gameStateEngine, renderingEngine)

const ws = new WebSocket("ws://localhost:8070");
ws.addEventListener("open", () =>{
    // Logger.info("We are connected");
});

ws.addEventListener('message', function (event) {
    gameStateEngine.gameState = JSON.parse(event.data)
});

const playerInputController = new PlayerInputController()
playerInputController.registerSubscription((playerInput) => {
    ws.send(JSON.stringify(playerInput))
})

clientGameEngine.start()
