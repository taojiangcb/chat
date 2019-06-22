"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SimpleCommand {
    constructor() { }
    receiver(protocol, socket) { }
    send(type, socket, ...args) { }
}
exports.SimpleCommand = SimpleCommand;
/**
 * 消息协议的收集管理
 */
class CommondInterface {
    constructor() {
        this.handls = new Map();
    }
    register(type, commond) {
        this.handls[type] = commond;
    }
    unregister(type) {
        var cls = this.handls[type];
        if (cls) {
            delete this.handls[type];
        }
        return cls;
    }
    receiver(type, protocol, socket) {
        var commond = this.handls[type];
        if (commond) {
            commond.receiver(protocol, socket);
        }
    }
    send(type, socket, ...args) {
        var commond = this.handls[type];
        if (commond) {
            commond.send.call(commond, type, socket, args);
        }
    }
}
exports.CommondInterface = CommondInterface;
exports.commands = new CommondInterface();
