import { Logger } from "./modules/shared/util/logger.mjs";
import { ServerGameEngine } from './modules/game-server/server-game-engine.mjs'
import { GameStateEngine } from "./modules/shared/game-state-engine.mjs";

// These lines make "require" available
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Importing the required modules
const WebSocketServer = require('ws');

const gameStateEngine = new GameStateEngine();
const serverGameEngine = new ServerGameEngine(gameStateEngine);

// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8070 })

// Creating connection using websocket
wss.on("connection", ws => {
    console.log("new client connecteddd");

    // sending message to client
    // ws.send('Welcome, you are connected!');
    gameStateEngine.registerSubscription((gameState) => {
        ws.send(JSON.stringify(gameState))
    })

    //on message from client
    ws.on("message", dataBuffer => {
        const data = dataBuffer.toString('utf8')
        Logger.debug(data)
        console.log(`Client has sent us: ${data}`)
        gameStateEngine.inputQueue.push(data)
    });

    // handling what to do when clients disconnect from server
    ws.on("close", () => {
        console.log("the client has connected");
    });
    // handling client connection error
    ws.onerror = function () {
        console.log("Some Error occurred")
    }
});
console.log("The WebSocket server is running on port 8070");

Logger.info("Server has started.")

serverGameEngine.start()

