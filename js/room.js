const Player = require("./player.js");

class Room {
    constructor() {
        this.players = new Map();
        this.friendlyFire = true;
    }

    async getAll() {
        return Array.from(this.players.values());
    }

    async get(uuid) {
        return this.players.get(uuid) || null;
    }

    async add(uuid, name = "Player") {
        if (!this.players.has(uuid)) {
            let red = 0;
            let blue = 0;
            for (const p of this.players.values()) {
                if (p.team === "red") red++;
                else if (p.team === "blue") blue++;
            }

            const player = new Player(uuid, name);
            player.team = red <= blue ? "red" : "blue";
            this.players.set(uuid, player);
        }
        return true;
    }

    async sync(uuid, json) {
        const player = this.players.get(uuid);
        if (!player) return false;
        player.setJSON(json);
        return true;
    }

    async remove(uuid) {
        return this.players.delete(uuid);
    }
}

module.exports = new Room();
