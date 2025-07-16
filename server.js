const express = require("express");
const WebSocket = require("ws");
const { v4 } = require("uuid");
const room = require("./js/room.js");
const Player = require("./js/player.js");

const app = express();
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log("Servidor escutando na porta:", PORT);
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
        event: "joined_server",
        content: { msg: "Bem-vindo ao servidor!", uuid }
    }));

    // Enviar jogador local
    socket.send(JSON.stringify({
        event: "local_player",
        content: {
            msg: `Você entrou como ${newPlayer.name}!`,
            player: newPlayer.toJSON()
        }
    }));

    // Enviar novo jogador para todos os outros
    wss.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                event: "new_player",
                content: {
                    msg: `${newPlayer.name} entrou no jogo!`,
                    player: newPlayer.toJSON()
                }
            }));
        }
    });

    // Enviar todos os outros jogadores ao novo cliente
    socket.send(JSON.stringify({
        event: "external_players",
        content: {
            msg: "Sincronizando jogadores existentes...",
            players: (await room.getAll())
                .filter(p => p.uuid !== uuid)
                .map(p => p.toJSON())
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

        switch (data.event) {
            case "update": {
                await room.update(uuid, data.content);

                const update = {
                    event: "update_player",
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
                const sender = await room.get(uuid);

                const chat = {
                    event: "new_chat_message",
                    content: {
                        uuid,
                        name: sender?.name || "???",
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
                console.warn("Evento desconhecido:", data.event);
                break;
        }
    });

    socket.on("close", async () => {
        const leaver = await room.get(uuid);
        console.log(`Cliente ${uuid} desconectado.`);

        await room.remove(uuid);

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    event: "player_disconnected",
                    content: {
                        uuid,
                        name: leaver?.name || "???",
                        msg: `${leaver?.name || "Um jogador"} saiu do jogo!`
                    }
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
}, 15000);

wss.on("close", () => clearInterval(interval));
