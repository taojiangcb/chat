"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SimpleCommand {
    constructor() { }
    receiver(protocol, socket) { }
    send(type, socket, ...args) { }
}
exports.SimpleCommand = SimpleCommand;
var handls = {};
function register(type, cls) {
    handls[type] = cls;
}
function unregister(type) {
    var cls = handls[type];
    if (cls) {
        delete handls[type];
    }
    return cls;
}
function receiver(type, protocol, socket) {
    var cls = handls[type];
    if (cls) {
        var commond = new cls();
        commond.receiver(protocol, socket);
    }
}
function send(type, socket, ...args) {
    var cls = handls[type];
    if (cls) {
        var commond = new cls();
        commond.send.call(commond, type, socket, args);
    }
}
exports.commonds = {
    register: register,
    unregister: unregister,
    receiver: receiver,
    send: send
};
//# sourceMappingURL=Commands.js.map