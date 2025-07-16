Original Project: https://github.com/welson-rodrigues/Servidor-Multiplayer-WebSocket


README.md

# 🌐 WebSocket Multiplayer Server

Servidor multiplayer em Node.js com WebSocket para jogos ou experiências em tempo real com múltiplos jogadores, suporte a posição, rotação e mensagens de chat.

---

## 🧱 Estrutura das Classes

### 📦 Player

Representa um jogador ativo na sala.

```js
class Player {
    uuid: string
    name: string
    position: Vector3
    rotation: Quaternion
}
setPosition(x, y, z)

setRotation(x, y, z, w)

setJSON(json) — atualiza posição, rotação ou nome dinamicamente.

toJSON() / fromJSON(json) — serialização/deserialização.

```

---

### 📦 Vector3

Representa uma posição 3D no espaço.
```js
class Vector3 {
    x: number
    y: number
    z: number
}

set(x, y, z)

toJSON() / fromJSON(json)

setJSON(json)

```

---

### 📦 Quaternion

Representa uma rotação em 3D.
```js
class Quaternion {
    x: number
    y: number
    z: number
    w: number
}

set(x, y, z, w)

toJSON() / fromJSON(json)

setJSON(json)

```
---

### 📦 room.js

Gerencia a lista de jogadores conectados.
```js
room.add(uuid, name)
room.get(uuid)
room.getAll()
room.update(uuid, json)
room.remove(uuid)

```
---

### 🔄 Eventos WebSocket

join

```json
{
  "event": "join",
  "content": { "name": "..." }
}
```
---

joined_server
```json
{
  "event": "joined_server",
  "content": { "msg": "Bem-vindo ao servidor!", "uuid": "..." }
}
```

---

local_player
```json
{
  "event": "local_player",
  "content": {
    "msg": "Você entrou como Player-abcde!",
    "player": { ... }
  }
}

```
---

new_player
```json
{
  "event": "new_player",
  "content": {
    "msg": "Player-abcde entrou no jogo!",
    "player": { ... }
  }
}
```

---

external_players
```json
{
  "event": "external_players",
  "content": {
    "msg": "Sincronizando jogadores existentes...",
    "players": [ { ... }, { ... } ]
  }
}

```
---

update (Cliente → Servidor)
```json
{
  "event": "update",
  "content": {
    "position": { "x": 10, "y": 5, "z": 2 },
    "rotation": { "x": 0, "y": 0, "z": 0, "w": 1 }
  }
}

```
---

update_player (Servidor → Outros clientes)
```json
{
  "event": "update_player",
  "content": {
    "uuid": "...",
    "position": { ... },
    "rotation": { ... }
  }
}
```

---

chat (Cliente → Servidor)
```json
{
  "event": "chat",
  "content": {
    "msg": "Olá galera!"
  }
}

```
---

new_chat_message (Servidor → Todos)
```json
{
  "event": "new_chat_message",
  "content": {
    "uuid": "...",
    "name": "Player-ab123",
    "msg": "Olá galera!"
  }
}

```
---

player_disconnected
```json
{
  "event": "player_disconnected",
  "content": {
    "uuid": "...",
    "name": "Player-ab123",
    "msg": "Player-ab123 saiu do jogo!"
  }
}
```

---

### ♻️ Ping-Pong Keep Alive

A cada 15 segundos, o servidor envia um ping. Se o cliente não responder com pong, ele é desconectado automaticamente.


---
