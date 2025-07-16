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

wss.on("connection", (socket) => {
    socket.isAlive = true;
    socket.on("pong", () => socket.isAlive = true);

    const uuid = v4();
    console.log("Player connected:", uuid);

    socket.on("message", async (message) => {
        let data;
        try {
            data = JSON.parse(message.toString());
        } catch (err) {
            return;
        }

        if (data.event === "join") {
            if (typeof data.name === "string" && data.name.trim().length > 0) {
                await room.add(uuid, data.name.trim());
            }
            return;
        }

        const player = await room.get(uuid);
        if (!player) return;

        if (data.event === "sync") {
            const content = { ...data.content };
            delete content.life;
            await room.sync(uuid, content);
            return;
        }

        if (data.event === "on_hit") {
            const { target, damage } = data;
            if (typeof target !== "string" || typeof damage !== "number") return;
            const targetPlayer = await room.get(target);
            if (!targetPlayer) return;
            const wasAlive = targetPlayer.life > 0;
            targetPlayer.life = Math.max(0, targetPlayer.life - damage);
            if (wasAlive && targetPlayer.life <= 0) {
                targetPlayer.isDeath = true;
                console.log("Player died:", target);
            }
            await room.update(target, targetPlayer);
            return;
        }

        if (data.event === "on_heal") {
            const { amount } = data;
            if (typeof amount !== "number") return;
            const wasDead = player.life <= 0;
            player.life = Math.min(100, player.life + amount);
            if (wasDead && player.life > 0) {
                player.isDeath = false;
                console.log("Player respawned:", uuid);
            }
            await room.update(uuid, player);
            return;
        }
    });

    socket.on("close", async () => {
        await room.remove(uuid);
        console.log("Player disconnected:", uuid);
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
}, 10000);

wss.on("close", () => clearInterval(interval));
