const Player = require("./js/player.js");

class Room {
  constructor() {
    this.players = new Map(); // uuid => Player
  }

  async getAll() {
    return Array.from(this.players.values());
  }

  async get(uuid) {
    return this.players.get(uuid) || null;
  }

  async add(uuid, name = "Player") {
    if (!this.players.has(uuid)) {
      const player = new Player(uuid, name);
      this.players.set(uuid, player);
    }
    return true;
  }

  async update(uuid, json) {
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
