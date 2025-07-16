README.md

---

# 🌐 WebSocket Multiplayer FPS Server

Servidor multiplayer em Node.js

---

## 🧱 Estrutura das Classes

### 📦 Player

Representa um jogador conectado na sala.

class Player {
    uuid: string           // Identificador único do jogador
    name: string           // Nome do jogador
    team: string | null    // Time do jogador ("red" ou "blue")
    life: number           // Vida atual do jogador

    position: Vector3      // Posição 3D no espaço
    bodyRotation: Vector2  // Rotação do corpo (eixo horizontal e vertical)
    viewRotation: Vector2  // Rotação da câmera/view (vertical)

    inventory: object      // Inventário do jogador (itens e quantidades)
    weapon: number         // Índice da arma atual
    weapons: array         // Lista de armas possuídas
    animations: array      // Animações em execução
}

Métodos principais:

setJSON(json): Atualiza o estado do jogador a partir de um objeto JSON.

toJSON(): Serializa o jogador para JSON para envio pela rede.

static fromJSON(json): Cria uma instância de Player a partir de JSON.



---

### 📦 Vector3

Representa uma posição ou vetor 3D.

class Vector3 {
    x: number
    y: number
    z: number

    set(x, y, z)
    setJSON(json)
    toJSON()
}


---

### 📦 Vector2

Representa um vetor 2D, usado para rotações simplificadas.

class Vector2 {
    x: number
    y: number

    set(x, y)
    setJSON(json)
    toJSON()
}


---

### 📦 Room (Sala)

Gerencia os jogadores conectados e a lógica de times.

class Room {
    players: Map<string, Player>  // Mapeamento uuid → Player
    friendlyFire: boolean          // Indica se dano amigo está ativado

    async add(uuid, name): adiciona um novo jogador, definindo time balanceado
    async get(uuid): obtém um jogador pelo uuid
    async getAll(): retorna todos os jogadores
    async sync(uuid, json): atualiza estado do jogador com dados recebidos
    async remove(uuid): remove jogador da sala
}


---

### 🔄 Eventos WebSocket

Eventos do Cliente para Servidor:

sync: Envia atualização do estado do jogador (posição, rotação, inventário, armas etc).


{
  "event": "sync",
  "content": {
    // Dados do jogador (posição, rotações, armas, inventário, animações, vida, etc)
  }
}


---

### Eventos do Servidor para Clientes:

player_sync: Envia a lista completa de jogadores atualizados a todos os clientes a cada 50ms.


{
  "event": "player_sync",
  "content": [
    { "uuid": "...", "name": "...", "team": "red", "life": 100, "position": {...}, ... },
    { "uuid": "...", "name": "...", "team": "blue", "life": 100, "position": {...}, ... }
  ]
}


---

### 🛠️ Funcionamento

A cada conexão WebSocket, é gerado um UUID único para o jogador.

O jogador é automaticamente adicionado à sala e recebe um time balanceado ("red" ou "blue").

O servidor recebe atualizações via evento sync e atualiza o estado do jogador internamente.

A cada 50ms, o servidor envia a lista completa de jogadores sincronizados para todos os clientes via player_sync.

O servidor envia um ping a cada 15 segundos para garantir que o cliente está vivo; se o cliente não responder com pong, a conexão é encerrada.

Ao desconectar, o jogador é removido da sala.



---

### Executar servidor:


node server.js

O servidor escutará na porta 8080 (ou a definida pela variável de ambiente PORT).



---

📚 Referências


Projeto original base: Servidor-Multiplayer-WebSocket (GitHub)

---
