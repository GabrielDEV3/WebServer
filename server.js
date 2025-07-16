const express = require("express");
const WebSocket = require("ws");
const { v4 } = require("uuid");
const room = require("./room.js");
const Player = require("./player.js");

const app = express();
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log("Server listening on port:", PORT);
});

const wss = new WebSocket.Server({ server });

wss.on("connection", async (socket) => {
    const uuid = v4();
    await room.add(uuid, `Player-${uuid.slice(0, 5)}`);
    const newPlayer = await room.get(uuid);

    // Ping-pong keep-alive
    socket.isAlive = true;
    socket.on("pong", () => socket.isAlive = true);

    // Enviar UUID ao cliente
    socket.send(JSON.stringify({
        cmd: "joined_server",
        content: { msg: "Bem-vindo ao servidor!", uuid }
    }));

    // Enviar jogador local
    socket.send(JSON.stringify({
        cmd: "spawn_local_player",
        content: { msg: "Spawning local (you) player!", player: newPlayer.toJSON() }
    }));

    // Enviar novo jogador para todos os outros
    wss.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                cmd: "spawn_new_player",
                content: { msg: "Spawning new network player!", player: newPlayer.toJSON() }
            }));
        }
    });

    // Enviar todos os outros jogadores ao novo cliente
    socket.send(JSON.stringify({
        cmd: "spawn_network_players",
        content: {
            msg: "Spawning network players!",
            players: (await room.getAll()).filter(p => p.uuid !== uuid).map(p => p.toJSON())
        }
    }));

    // Processar mensagens
    socket.on("message", async (message) => {
        let data;
        try {
            data = JSON.parse(message.toString());
        } catch (err) {
            console.error("Erro ao fazer parse do JSON:", err);
            return;
        }

        switch (data.cmd) {
            case "update": {
                await room.update(uuid, data.content);

                const update = {
                    cmd: "update_player",
                    content: {
                        uuid,
                        ...data.content
                    }
                };

                wss.clients.forEach((client) => {
                    if (client !== socket && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(update));
                    }
                });
                break;
            }

            case "chat": {
                const chat = {
                    cmd: "new_chat_message",
                    content: {
                        uuid,
                        msg: data.content.msg
                    }
                };

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(chat));
                    }
                });
                break;
            }

            default:
                console.warn("Comando desconhecido:", data.cmd);
                break;
        }
    });

    socket.on("close", async () => {
        console.log(`Cliente ${uuid} desconectado.`);

        await room.remove(uuid);

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    cmd: "player_disconnected",
                    content: { uuid }
                }));
            }
        });
    });
});

// Intervalo ping-pong para desconectar clientes mortos
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on("close", () => clearInterval(interval));
