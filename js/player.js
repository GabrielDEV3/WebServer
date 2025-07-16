const { Vector3 } = require("./js/vector3.js");
const { Quaternion } = require("./js/quaternion.js");

class Player {
    constructor(uuid, name) {
        this.uuid = uuid;
        this.name = name;
        this.position = new Vector3(0, 0, 0);
        this.rotation = new Quaternion(0, 0, 0, 1);
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
    }

    setRotation(x, y, z, w) {
        this.rotation.set(x, y, z, w);
    }

    setJSON(json) {
        if (!json) return;
        if (json.name !== undefined) this.name = json.name;
        if (json.position !== undefined) this.position.setJSON(json.position);
        if (json.rotation !== undefined) this.rotation.setJSON(json.rotation);
    }

    toJSON() {
        return {
            uuid: this.uuid,
            name: this.name,
            position: this.position.toJSON(),
            rotation: this.rotation.toJSON()
        };
    }

    static fromJSON(json) {
        const player = new Player(json.uuid, json.name);
        player.position = Vector3.fromJSON(json.position);
        player.rotation = Quaternion.fromJSON(json.rotation);
        return player;
    }
}

module.exports = Player;
