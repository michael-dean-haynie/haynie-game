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
    // console.log("We are connected");
    // ws.send("How are you?");
});

ws.addEventListener('message', function (event) {
    // console.log(event.data)
    gameStateEngine.gameState = JSON.parse(event.data)
});

Logger.info("Client has started.")

const playerInputController = new PlayerInputController()
playerInputController.registerSubscription((playerInput) => {
    Logger.debug(`subscription was triggered for command: '${playerInput}'`)
    ws.send(playerInput)
})

clientGameEngine.start()
