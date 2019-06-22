"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const app_1 = require("../../app");
const ChatSocket_1 = require("./ChatSocket");
const RegisterCommond_1 = require("./commonds/RegisterCommond");
const MessageCommond_1 = require("./commonds/MessageCommond");
const Log_1 = require("chatcommon/src/log/Log");
const IProtocol_1 = require("chatcommon/src/IProtocol");
const Commands_1 = require("chatcommon/src/Commands");
class ChatGatewaySvr {
    constructor() {
        this.config = app_1.appGlobal.config ? app_1.appGlobal.config : null;
        var register_command = new RegisterCommond_1.RegisterCommond();
        Commands_1.commands.register(IProtocol_1.IProtocolType.register, register_command);
        Commands_1.commands.register(IProtocol_1.IProtocolType.status, register_command);
        Commands_1.commands.register(IProtocol_1.IProtocolType.message, new MessageCommond_1.MessageCommand());
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