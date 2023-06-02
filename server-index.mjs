import { require } from "./modules/shared/util/require.mjs";
import { Logger } from "./modules/shared/util/logger.mjs";
import { ServerGameEngine } from './modules/game-server/server-game-engine.mjs'
import { GameStateEngine } from "./modules/shared/game-state-engine.mjs";
import { v4 as uuidv4 } from 'uuid';
import {SmoothDiagnostic} from "./modules/shared/util/smooth-diagnostic.mjs";
const WebSocketServer = require('ws');

const gameStateEngine = new GameStateEngine();
const serverGameEngine = new ServerGameEngine(gameStateEngine);

// Creating a new websocket server
const connections = new Map()
const wss = new WebSocketServer.Server({ port: 8070 })

wss.on("connection", ws => {
    const connection = ws
    const connectionId = uuidv4()
    connections.set(connectionId, connection)
    gameStateEngine.addPlayer(connectionId)

    // publish gameState updates to client
    gameStateEngine.registerSubscription((gameState, clientPingTsMap) => {
        ws.send(JSON.stringify({
            type: 'game-state-update',
            value: gameState,
            clientPingTs: clientPingTsMap.get(connectionId)
        }))
    })

    // publish diagnostics updates to client
    serverGameEngine.registerSubscription((diagnostics) => {
        ws.send(JSON.stringify({
            type: 'diagnostics-update',
            value: {
                ...diagnostics,
                aps: diagnostics.aps[connectionId]
            }
        }))
    })

    // enqueue game input from client
    ws.on("message", dataBuffer => {
        const data = dataBuffer.toString('utf8')
        const input = JSON.parse(data)
        input.playerId = connectionId
        input.timestamp = Date.now()
        gameStateEngine.inputQueue.push(input)
    });

    // handling what to do when clients disconnect from server
    ws.on("close", () => {
        Logger.info("The client has disconnected")
        gameStateEngine.removePlayer(connectionId)
        connections.delete(connectionId)
    });

    // handling client connection error
    ws.onerror = function () {
        Logger.error("Some Error occurred")
    }
});

Logger.info("Server has started.")

serverGameEngine.start()

