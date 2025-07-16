const express = require("express");
const WebSocket = require("ws");
const { v4 } = require("uuid");
const room = require("./js/room.js");

const app = express();
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log("Servidor escutando na porta:", PORT);
});

const wss = new WebSocket.Server({ server });

wss.on("connection", async (socket) => {
    socket.isAlive = true;
    socket.on("pong", () => socket.isAlive = true);

    const uuid = v4();
    await room.add(uuid, "Player");
    const player = await room.get(uuid);

    socket.on("message", async (message) => {
        let data;
        try {
            data = JSON.parse(message.toString());
        } catch (err) {
            console.error("Erro ao fazer parse do JSON:", err);
            return;
        }

        if (data.event === "sync") {
            await room.sync(uuid, data.content);
        }
    });

    socket.on("close", async () => {
        await room.remove(uuid);
    });
});

setInterval(async () => {
    const allPlayers = await room.getAll();
    const sync = JSON.stringify({
        event: "player_sync",
        content: allPlayers.map(p => p.toJSON())
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(sync);
        }
    });
}, 50);

const interval = setInterval(() => {
    wss.clients.forEach(ws => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 15000);

wss.on("close", () => clearInterval(interval));
