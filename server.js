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
        } catch {
            return;
        }

        if (data.event === "join") {
            if (typeof data.name === "string" && data.name.trim()) {
                await room.add(uuid, data.name.trim());
            }
            return;
        }

        const player = await room.get(uuid);
        if (!player) return;

        if (data.event === "sync") {
            const content = { ...data.content };
            delete content.life;
            if (typeof content.state === "string") player.state = content.state;
            if (typeof content.animation === "string") player.animation = content.animation;
            await room.sync(uuid, content);
            return;
        }

        if (data.event === "on_hit") {
            const { target, damage } = data;
            if (typeof target !== "string" || typeof damage !== "number") return;
            const targetPlayer = await room.get(target);
            if (!targetPlayer) return;

            if (!room.friendlyFire && player.team === targetPlayer.team) return;

            const wasAlive = targetPlayer.life > 0;
            targetPlayer.life = Math.max(0, targetPlayer.life - damage);

            if (wasAlive && targetPlayer.life <= 0) {
                targetPlayer.state = "death";
                console.log("Player died:", target);
            }

            await room.sync(target, targetPlayer);
            return;
        }

        if (data.event === "on_heal") {
            const { amount } = data;
            if (typeof amount !== "number") return;
            const wasDead = player.life <= 0;
            player.life = Math.min(100, player.life + amount);

            if (wasDead && player.life > 0) {
                player.state = "alive";
                console.log("Player respawned:", uuid);
            }

            await room.sync(uuid, player);
            return;
        }

        if (data.event === "chat") {
            const msg = typeof data.message === "string" ? data.message.trim() : "";
            if (!msg) return;

            console.log(`Chat [${player.name} | ${uuid}]: ${msg}`);

            const payload = JSON.stringify({
                event: "message",
                from: { uuid, name: player.name },
                message: msg
            });

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(payload);
                }
            });

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
}, 15000);

wss.on("close", () => clearInterval(interval));
