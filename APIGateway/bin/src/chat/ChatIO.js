"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const Log_1 = require("../log/Log");
class ChatIO {
    constructor() {
        this.clients = {};
    }
    addClient(socket) {
        this.clients[socket.svr_name] = socket;
    }
    removeClient(svr_name) {
        var client = this.clients[svr_name];
        if (client) {
            if (client.sc.readyState == WebSocket.CLOSED) {
                delete this.clients[svr_name];
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
            client.send(protocol);
        }
        else if (tosvrs && tosvrs.length > 0) {
            var len = tosvrs.length;
            while (--len > -1) {
                var key = tosvrs[len];
                this.clients[key].send(protocol);
            }
        }
        else if (to_server === "*") {
            for (var key in this.clients) {
                this.clients[key].send(protocol);
            }
        }
    }
}
exports.chatIo = new ChatIO();
//# sourceMappingURL=ChatIO.js.map