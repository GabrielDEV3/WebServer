class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    setJSON(json) {
        if (!json) return;
        if ('x' in json) this.x = json.x;
        if ('y' in json) this.y = json.y;
    }

    toJSON() {
        return { x: this.x, y: this.y };
    }

    copy() {
        return new Vector2(this.x, this.y);
    }
}

module.exports = Vector2;
