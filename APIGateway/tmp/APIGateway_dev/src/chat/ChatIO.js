"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const Log_1 = require("chatcommon/src/log/Log");
exports.svrCache = new Map();
class ChatIO {
    constructor() {
        this.clients = {};
    }
    addClient(socket) {
        this.clients[socket.svr_name] = socket;
        Log_1.Log.infoLog(`add svr client [${socket.svr_name}]`);
    }
    removeClient(svr_name) {
        var client = this.clients[svr_name];
        if (client) {
            if (!client.sc || client.sc.readyState == WebSocket.CLOSED) {
                delete this.clients[svr_name];
                Log_1.Log.infoLog(`delete svr client [${svr_name}]`);
                return true;
            }
            else {
                return false;
            }
        }
        return true;
    }
    closeClient(svr_name) {
        var client = this.clients[svr_name];
        if (client) {
            client.sc.close();
        }
    }
    allClients() {
        var collection = [];
        for (var key in this.clients) {
            collection.push(this.clients[key]);
        }
        return collection;
    }
    send(protocol) {
        var to_server = protocol.to_chat_svr || "";
        var tosvrs = to_server.split("|");
        if (!protocol.in_char_svr) {
            var msg = `message fail : ${JSON.stringify(protocol)}`;
            Log_1.Log.errorLog(msg);
            return;
        }
        if (to_server === "") {
            to_server = protocol.in_char_svr;
        }
        if (to_server === protocol.in_char_svr) {
            let client = this.clients[to_server];
            if (client) {
                client.send(protocol);
            }
            else {
                Log_1.Log.errorLog(`服务器不存在无效数据${JSON.stringify(protocol)}`);
            }
            Log_1.Log.infoLog(`发送到同一台服务器${JSON.stringify(protocol)}`);
        }
        else if (tosvrs && tosvrs.length > 0) {
            var len = tosvrs.length;
            while (--len > -1) {
                var key = tosvrs[len];
                let client = this.clients[key];
                if (client) {
                    client.send(protocol);
                }
                Log_1.Log.infoLog(`同步到多台服务上${JSON.stringify(protocol)}`);
            }
        }
        else if (to_server === "*") {
            for (var key in this.clients) {
                let client = this.clients[key];
                if (client) {
                    client.send(protocol);
                }
                Log_1.Log.infoLog(`广播到所有的服务:${JSON.stringify(protocol)}`);
            }
        }
    }
}
exports.chatIo = new ChatIO();
//# sourceMappingURL=ChatIO.js.map