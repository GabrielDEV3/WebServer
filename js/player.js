const { Vector3 } = require("./vector3");
const { Vector2 } = require("./vector2");

class Player {
    constructor(uuid, name) {
        this.uuid = uuid;
        this.name = name;
        this.team = null;
        this.life = 100;

        this.position = new Vector3(0, 0, 0);
        this.bodyRotation = new Vector2(0, 0);
        this.viewRotation = new Vector2(0, 0);

        this.inventory = {};
        this.weapon = 0;
        this.weapons = [];
        this.animations = [];
    }

    setJSON(json) {
        if (!json) return;

        if ("name" in json) this.name = json.name;
        if ("life" in json) this.life = json.life;
        if ("position" in json) this.position.setJSON(json.position);
        if ("bodyRotation" in json) this.bodyRotation.setJSON(json.bodyRotation);
        if ("viewRotation" in json) this.viewRotation.setJSON(json.viewRotation);
        if ("inventory" in json) this.inventory = { ...json.inventory };
        if ("animations" in json) this.animations = json.animations;
        if ("weapon" in json) this.weapon = json.weapon;
        if ("weapons" in json) this.weapons = [...json.weapons];
    }

    toJSON() {
        return {
            uuid: this.uuid,
            name: this.name,
            team: this.team,
            life: this.life,
            position: this.position.toJSON(),
            bodyRotation: this.bodyRotation.toJSON(),
            viewRotation: this.viewRotation.toJSON(),
            inventory: this.inventory,
            weapon: this.weapon,
            weapons: this.weapons,
            animations: this.animations
        };
    }

    static fromJSON(json) {
        const p = new Player(json.uuid, json.name ?? "Unknown");
        p.setJSON(json);
        return p;
    }
}

module.exports = Player;
