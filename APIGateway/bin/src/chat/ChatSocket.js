"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const Commands_1 = require("./Commands");
const Log_1 = require("../log/Log");
const ChatIO_1 = require("./ChatIO");
const timers_1 = require("timers");
class ChatSocket {
    constructor(socket) {
        this.svr_name = "";
        this.heartPingPong();
        this.sc = socket;
        if (socket) {
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
            Commands_1.commonds.receiver(protocol.type, protocol, this);
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