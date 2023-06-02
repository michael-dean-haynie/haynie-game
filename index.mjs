import { Logger } from "./modules/shared/util/logger.mjs";
import { ClientGameEngine } from "./modules/game-client/client-game-engine.mjs";
import { PlayerInputController } from "./modules/game-client/player-input-controller.mjs";
import {GameStateEngine} from "./modules/shared/game-state-engine.mjs";
import {RenderingEngine} from "./modules/game-client/rendering-engine.mjs";
import {SmoothDiagnostic} from "./modules/shared/util/smooth-diagnostic.mjs";
// import { v4 as uuidv4 } from 'uuid';

const gameStateEngine = new GameStateEngine()
const renderingEngine = new RenderingEngine(document.getElementById('canvas'))
const clientGameEngine = new ClientGameEngine(gameStateEngine, renderingEngine)
const ping = new SmoothDiagnostic(0.99, 10)

const ws = new WebSocket("ws://localhost:8070");
ws.addEventListener("open", () =>{
    // Logger.info("We are connected");
});

ws.addEventListener('message', function (event) {
    const serverUpdate = JSON.parse(event.data)
    clientGameEngine.newUpdates++
    if (serverUpdate.type === 'game-state-update') {
        gameStateEngine.gameState = serverUpdate.value
        if (serverUpdate.clientPingTs !== undefined) {
            console.log(Date.now(), serverUpdate.clientPingTs)
            ping.update(Date.now() - serverUpdate.clientPingTs)
            renderingEngine.diagnostics.ping = Math.floor(ping.smoothValue)
        }
    }

    if (serverUpdate.type === 'diagnostics-update') {
        if (serverUpdate.value.tps !== undefined){
            renderingEngine.diagnostics.tps = serverUpdate.value.tps
        }
        if (serverUpdate.value.ticks !== undefined){
            renderingEngine.diagnostics.ticks = serverUpdate.value.ticks
        }
        if (serverUpdate.value.aps !== undefined){
            renderingEngine.diagnostics.aps = serverUpdate.value.aps
        }
    }
});

const playerInputController = new PlayerInputController()
playerInputController.registerSubscription((playerInput) => {
    ws.send(JSON.stringify({
        ...playerInput,
        clientPingTs: Date.now()
    }))
})

clientGameEngine.start()
