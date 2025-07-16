class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.set(x, y, z);
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    toJSON() {
        return { x: this.x, y: this.y, z: this.z };
    }

    static fromJSON(json) {
        return new Vector3(json.x, json.y, json.z);
    }
}

module.exports = { Vector3 };
