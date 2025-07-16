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
    socket.isAlive = true;
    socket.on("pong", () => socket.isAlive = true);

    const uuid = v4();
    let player = null;

    // Aguardar primeiro pacote do cliente com nome
    socket.once("message", async (message) => {
        let data;
        try {
            data = JSON.parse(message.toString());
        } catch (e) {
            console.warn("Erro de JSON no join inicial.");
            return socket.close();
        }

        if (data.event !== "join" || !data.content?.name) {
            return socket.send(JSON.stringify({
                event: "error",
                content: { msg: "Evento 'join' com nome é obrigatório." }
            }));
        }

        const name = data.content.name;
        await room.add(uuid, name);
        player = await room.get(uuid);

        console.log(`🎮 Jogador conectado: ${name} (${uuid})`);

        socket.send(JSON.stringify({
            event: "joined_server",
            content: { msg: "Bem-vindo ao servidor!", uuid }
        }));

        socket.send(JSON.stringify({
            event: "local_player",
            content: {
                msg: `Você entrou como ${player.name}!`,
                player: player.toJSON()
            }
        }));

        // Notificar outros jogadores
        wss.clients.forEach((client) => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    event: "new_player",
                    content: {
                        msg: `${player.name} entrou no jogo!`,
                        player: player.toJSON()
                    }
                }));
            }
        });

        // Enviar lista de jogadores existentes
        socket.send(JSON.stringify({
            event: "external_players",
            content: {
                msg: "Sincronizando jogadores!",
                players: (await room.getAll())
                    .filter(p => p.uuid !== uuid)
                    .map(p => p.toJSON())
            }
        }));

        // Processar mensagens normais
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
                    const chat = {
                        event: "new_chat_message",
                        content: {
                            uuid,
                            name: player?.name || "???",
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
            console.log(`${leaver?.name || uuid} desconectado.`);
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
});

// Ping para desconectar clientes inativos
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 15000);

wss.on("close", () => clearInterval(interval));
