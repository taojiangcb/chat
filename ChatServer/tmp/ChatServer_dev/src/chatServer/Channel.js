"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Channel {
    constructor(name) {
        this.name = name;
        this.ids = [];
    }
    addUser(id) {
        if (this.ids.indexOf(id) == -1) {
            this.ids.push(id);
        }
        return this.ids;
    }
    removeUser(id) {
        var index = this.ids.indexOf(id);
        if (index > -1) {
            this.ids.splice(index, 1);
        }
        return this.ids;
    }
}
exports.Channel = Channel;
//# sourceMappingURL=Channel.js.map