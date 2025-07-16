const Player = require("./player.js");

class Room {
  constructor() {
    this.players = new Map();
    this.teams = {
      red: new Set(),
      blue: new Set()
    };
  }

  async getAll() {
    return Array.from(this.players.values());
  }

  async get(uuid) {
    return this.players.get(uuid) || null;
  }

  async getTeam(teamName) {
    if (!this.teams[teamName]) return [];
    return Array.from(this.teams[teamName])
      .map(uuid => this.players.get(uuid))
      .filter(Boolean);
  }

  async add(uuid, name = "Player") {
    if (this.players.has(uuid)) return false;
    const team = this.teams.red.size <= this.teams.blue.size ? "red" : "blue";

    const player = new Player(uuid, name);
    player.team = team;

    this.players.set(uuid, player);
    this.teams[team].add(uuid);

    return true;
  }

  async update(uuid, json) {
    const player = this.players.get(uuid);
    if (!player) return false;

    player.setJSON(json);
    return true;
  }

  async remove(uuid) {
    const player = this.players.get(uuid);
    if (!player) return false;
    if (player.team && this.teams[player.team]) {
      this.teams[player.team].delete(uuid);
    }

    return this.players.delete(uuid);
  }
}

module.exports = new Room();
