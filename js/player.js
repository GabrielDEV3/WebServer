const { Vector3 } = require("./vector3.js");
const { Quaternion } = require("./quaternion.js");

class Player {
    constructor(uuid, name) {
        this.uuid = uuid;
        this.name = name;
        this.position = new Vector3(0, 0, 0);
        this.rotation = new Quaternion(0, 0, 0, 1);
        this.life = 100;
        this.inventory = {}; 
        this.animations = [];
        this.currentItem = 0;
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
    }

    setRotation(x, y, z, w) {
        this.rotation.set(x, y, z, w);
    }

    setJSON(json) {
        if (!json) return;

        if ("name" in json) this.name = json.name;
        if ("life" in json) this.life = json.life;
        if ("inventory" in json && typeof json.inventory === "object")
            this.inventory = { ...json.inventory };
        if ("animations" in json && Array.isArray(json.animations))
            this.animations = json.animations.map(a => ({
                index: a.index ?? 0,
                weight: a.weight ?? 0
            }));
        if ("currentItem" in json) this.currentItem = parseInt(json.currentItem) || 0;
        if ("position" in json) this.position.setJSON(json.position);
        if ("rotation" in json) this.rotation.setJSON(json.rotation);
    }

    toJSON() {
        return {
            uuid: this.uuid,
            name: this.name,
            life: this.life,
            inventory: this.inventory,
            animations: this.animations,
            currentItem: this.currentItem,
            position: this.position.toJSON(),
            rotation: this.rotation.toJSON()
        };
    }

    static fromJSON(json) {
        const player = new Player(json.uuid, json.name ?? "Unknown");

        if ("life" in json) player.life = json.life;
        if ("inventory" in json && typeof json.inventory === "object")
            player.inventory = { ...json.inventory };
        if ("animations" in json && Array.isArray(json.animations))
            player.animations = json.animations.map(a => ({
                index: a.index ?? 0,
                weight: a.weight ?? 0
            }));
        if ("currentItem" in json) player.currentItem = parseInt(json.currentItem) || 0;
        if ("position" in json)
            player.position = Vector3.fromJSON(json.position);
        if ("rotation" in json)
            player.rotation = Quaternion.fromJSON(json.rotation);

        return player;
    }
}

module.exports = Player;
