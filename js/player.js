const Vector3 = require("./vector3");
const Vector2 = require("./vector2");

class Player {
    constructor(uuid, name) {
        this.uuid = uuid;
        this.name = name;
        this.team = null;
        this.life = 100;

        this.position = new Vector3(0, 0, 0);
        this.rotations = [new Vector2(0, 0), new Vector2(0, 0)];

        this.weapon = -1;
        this.weapons = [];

        this.state = "alive";
        this.animation = "idle";
    }

    setJSON(json) {
        if (!json) return;

        if ("name" in json) this.name = json.name;
        if ("team" in json) this.team = json.team;
        if ("life" in json) this.life = json.life;
        if ("position" in json) this.position.setJSON(json.position);
        if ("rotations" in json && Array.isArray(json.rotations) && json.rotations.length === 2) {
            this.rotations[0].setJSON(json.rotations[0]);
            this.rotations[1].setJSON(json.rotations[1]);
        }
        
        if ("weapon" in json) this.weapon = json.weapon;
        if ("weapons" in json) this.weapons = [...json.weapons];
        if ("state" in json && typeof json.state === "string") this.state = json.state;
        if ("animation" in json && typeof json.animation === "string") this.animation = json.animation;
    }

    toJSON() {
        return {
            uuid: this.uuid,
            name: this.name,
            team: this.team,
            life: this.life,
            position: this.position.toJSON(),
            rotations: [this.rotations[0].toJSON(), this.rotations[1].toJSON()],
            weapon: this.weapon,
            weapons: this.weapons,
            state: this.state,
            animation: this.animation
        };
    }

    static fromJSON(json) {
        const p = new Player(json.uuid, json.name ?? "Unknown");
        if ("team" in json) p.team = json.team;
        p.setJSON(json);
        return p;
    }
}

module.exports = Player;
