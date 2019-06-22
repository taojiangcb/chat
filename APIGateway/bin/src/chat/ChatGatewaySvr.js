"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const http = require("http");
const app_1 = require("../../app");
const ChatSocket_1 = require("./ChatSocket");
const Commands_1 = require("./Commands");
const RegisterCommond_1 = require("./commonds/RegisterCommond");
const MessageCommond_1 = require("./commonds/MessageCommond");
const Log_1 = require("../log/Log");
const common = require("common");
class ChatGatewaySvr {
    constructor() {
        this.httpsvr = http.createServer();
        this.config = app_1.appGlobal.config ? app_1.appGlobal.config : null;
        Commands_1.commonds.register(common.IProtocolType.register, RegisterCommond_1.RegisterCommond);
        Commands_1.commonds.register(common.IProtocolType.status, RegisterCommond_1.RegisterCommond);
        Commands_1.commonds.register(common.IProtocolType.message, MessageCommond_1.MessageCommand);
        if (!this.config) {
            var msg = "config is error";
            throw new Error(msg);
        }
        this.wss = new WebSocket.Server({ port: this.config.ws_port });
        this.wss.on("connection", this.onConnection.bind(this));
        this.wss.on("error", this.onError.bind(this));
    }
    onConnection(socket, require) {
        new ChatSocket_1.ChatSocket(socket);
    }
    onError(socket, error) {
        var msg = error.stack ? error.stack : error.message;
        Log_1.Log.errorLog(msg);
    }
}
exports.ChatGatewaySvr = ChatGatewaySvr;
//# sourceMappingURL=ChatGatewaySvr.js.map