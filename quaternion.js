class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.set(x, y, z, w);
    }

    set(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    toJSON() {
        return { x: this.x, y: this.y, z: this.z, w: this.w };
    }

    static fromJSON(json) {
        return new Quaternion(json.x, json.y, json.z, json.w);
    }
}

module.exports = { Quaternion };
