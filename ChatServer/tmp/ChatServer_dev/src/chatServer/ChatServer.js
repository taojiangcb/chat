"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const IProtocol_1 = require("chatcommon/src/IProtocol");
const WatchCommond_1 = require("../commonds/WatchCommond");
const MessageCommand_1 = require("../commonds/MessageCommand");
const Log_1 = require("chatcommon/src/log/Log");
const ChatClient_1 = require("./ChatClient");
const ChannelCommand_1 = require("../commonds/ChannelCommand");
const app_1 = require("../../app");
const Commands_1 = require("chatcommon/src/Commands");
class ChatServer {
    constructor() {
        this.config = app_1.appGlobal.config;
        var channelCmd = new ChannelCommand_1.ChannelCommond();
        Commands_1.commands.register(IProtocol_1.IProtocolType.watch, new WatchCommond_1.WatchCommond());
        Commands_1.commands.register(IProtocol_1.IProtocolType.message, new MessageCommand_1.MessageCommand());
        Commands_1.commands.register(IProtocol_1.IProtocolType.joinChannel, channelCmd);
        Commands_1.commands.register(IProtocol_1.IProtocolType.levelChannel, channelCmd);
        if (!this.config) {
            var msg = "config is error";
            throw new Error(msg);
        }
        const port = this.config.chat_port;
        this.ws = new WebSocket.Server({ port: port });
        this.ws.on("connection", this.onConnection.bind(this));
        this.ws.on("error", this.onError.bind(this));
        Log_1.Log.debug("start chatServer port:" + port);
    }
    onConnection(socket, require) {
        new ChatClient_1.ChatClient(socket);
    }
    onError(event) {
        Log_1.Log.errorLog(event);
    }
}
exports.ChatServer = ChatServer;
//# sourceMappingURL=ChatServer.js.map