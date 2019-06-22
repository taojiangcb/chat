"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const Log_1 = require("chatcommon/src/log/Log");
const ChatIO_1 = require("./ChatIO");
const timers_1 = require("timers");
const Commands_1 = require("chatcommon/src/Commands");
class ChatSocket {
    constructor(socket) {
        this.svr_name = "";
        this.sc = socket;
        if (socket) {
            this.heartPingPong();
            socket.on("message", this.onMessage.bind(this));
            socket.on("close", this.onClose.bind(this));
            socket.on("error", this.onError.bind(this));
            socket.on("pong", this.onPong.bind(this));
        }
    }
    heartPingPong() {
        if (this.pingTimeOut) {
            timers_1.clearTimeout(this.pingTimeOut);
            this.pingTimeOut = undefined;
        }
        var checkTime = 10000;
        this.pingTimeOut = timers_1.setTimeout(() => { this.sc.ping(); }, checkTime);
    }
    onMessage(data) {
        try {
            var protocol = JSON.parse(String(data));
            Commands_1.commands.receiver(protocol.type, protocol, this);
        }
        catch (_a) {
            var msg = "parse protocol error";
            Log_1.Log.errorLog(msg);
        }
    }
    onClose(code, reson) {
        if (this.pingTimeOut) {
            timers_1.clearTimeout(this.pingTimeOut);
            this.pingTimeOut = undefined;
        }
        ChatIO_1.chatIo.removeClient(this.svr_name);
        var caches = ChatIO_1.svrCache;
        for (var i = 0; i < caches.keys.length; i++) {
            var key = caches.keys[i];
            if (caches[key] == this.svr_register) {
                caches.delete(key);
                break;
            }
        }
    }
    onError(error) {
        var msg = error.stack ? error.stack : error.message;
        Log_1.Log.errorLog(msg);
    }
    onPong(data) {
        this.heartPingPong();
    }
    send(protocol) {
        if (this.sc && this.sc.readyState === WebSocket.OPEN) {
            var source = JSON.stringify(protocol);
            try {
                this.sc.send(source);
            }
            catch (e) {
                var msg = e.stack ? e.stack : e.message;
                Log_1.Log.errorLog(msg);
            }
        }
    }
}
exports.ChatSocket = ChatSocket;
//# sourceMappingURL=ChatSocket.js.map