"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const Log_1 = require("chatcommon/src/log/Log");
const IProtocol_1 = require("chatcommon/src/IProtocol");
const Commands_1 = require("chatcommon/src/Commands");
const Product_1 = require("./Product");
class ChatClient {
    constructor(socket) {
        if (socket) {
            this.heartPingPong();
            this.sc = socket;
            socket.on("message", this.onMessage.bind(this));
            socket.on("close", this.onClose.bind(this));
            socket.on("error", this.onError.bind(this));
            socket.on("pong", this.onPong.bind(this));
        }
    }
    heartPingPong() {
        if (this.pingTimeOut) {
            clearTimeout(this.pingTimeOut);
            this.pingTimeOut = undefined;
        }
        var checkTime = 10000;
        this.pingTimeOut = setTimeout(() => { this.sc.ping(); }, checkTime);
    }
    onMessage(data) {
        try {
            var protocol = JSON.parse(String(data));
            if (protocol.type !== IProtocol_1.IProtocolType.watch && !this.watchBody) {
                const msg = `非法连接 断开 userid:${protocol.id}`;
                Log_1.Log.infoLog(msg);
                this.sc.close();
                return;
            }
            Commands_1.commands.receiver(protocol.type, protocol, this);
            Log_1.Log.infoLog(String(data));
        }
        catch (_a) {
            var msg = "parse protocol error";
            Log_1.Log.errorLog(msg);
        }
    }
    onClose(code, reson) {
        if (this.pingTimeOut) {
            clearTimeout(this.pingTimeOut);
            this.pingTimeOut = undefined;
        }
        if (this.watchBody) {
            Product_1.product.removeClient(this.watchBody.userId, this.watchBody.product);
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
            try {
                var source = JSON.stringify(protocol);
                this.sc.send(source);
                Log_1.Log.infoLog(`${protocol.id} send msg:${source}`);
            }
            catch (e) {
                var msg = e.stack ? e.stack : e.message;
                Log_1.Log.errorLog(msg);
            }
        }
    }
}
exports.ChatClient = ChatClient;
//# sourceMappingURL=ChatClient.js.map