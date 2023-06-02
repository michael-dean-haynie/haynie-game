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
    const serverUpdate = JSON.parse(event.data)
    if (serverUpdate.type === 'game-state-update') {
        gameStateEngine.gameState = serverUpdate.value
    }

    if (serverUpdate.type === 'diagnostics-update') {
        renderingEngine.diagnostics.tps = serverUpdate.value.tps
        renderingEngine.diagnostics.ticks = serverUpdate.value.ticks
    }
});

const playerInputController = new PlayerInputController()
playerInputController.registerSubscription((playerInput) => {
    ws.send(JSON.stringify(playerInput))
})

clientGameEngine.start()
