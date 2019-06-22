"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = require("chatcommon/src/log/Log");
const WebSocket = require("ws");
const IProtocol_1 = require("chatcommon/src/IProtocol");
const http_1 = require("chatcommon/src/http/http");
const Commands_1 = require("chatcommon/src/Commands");
const WatchCommond_1 = require("./WatchCommond");
const ChannelCommand_1 = require("./ChannelCommand");
class ChatClient {
    constructor(opt) {
        this.isAlive = false;
        this.try_connect_count = 5;
        this.try_agin = 0;
        Log_1.Log.log4jInit(__dirname, true);
        Log_1.Log.debug("12306");
        this.opts = opt;
        var channelCmd = new ChannelCommand_1.ChannelCommand();
        Commands_1.commands.register(IProtocol_1.IProtocolType.watch, new WatchCommond_1.WatchCommon());
        Commands_1.commands.register(IProtocol_1.IProtocolType.joinChannel, channelCmd);
        Commands_1.commands.register(IProtocol_1.IProtocolType.levelChannel, channelCmd);
    }
    getChatSvr() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.chat_svr = (yield http_1.httpRequest.post(this.opts.gateway_url, { formData: this.opts }));
            }
            catch (e) {
                Log_1.Log.errorLog(e.stack || e.message);
            }
            if (this.chat_svr) {
                this.connect();
            }
        });
    }
    connect() {
        if (this.chat_svr) {
            console.log(this.chat_svr);
            var host = this.chat_svr.ip;
            var port = this.chat_svr.port;
            var url = "ws://" + host + (port > 0 ? `:${port}` : "");
            this.chatWs = new WebSocket(url);
            this.chatWs.on("open", this.onOpen.bind(this));
            this.chatWs.on("message", this.onMessage.bind(this));
            this.chatWs.on("error", this.onError.bind(this));
            this.chatWs.on("close", this.onClose.bind(this));
            this.chatWs.on("ping", this.onPing.bind(this));
        }
    }
    onError(error) {
        var err_str = error && error.stack ? error.stack : error.message;
        var msg = `ws error msg:${err_str}`;
        Log_1.Log.errorLog(msg);
    }
    onOpen() {
        this.isAlive = true;
        this.try_agin = 0;
        Commands_1.commands.send(IProtocol_1.IProtocolType.watch, this);
    }
    onMessage(data) {
        var protocol;
        try {
            protocol = JSON.parse(String(data));
        }
        catch (e) {
            const err_str = e && e.stack ? e.stack : e.message;
            Log_1.Log.errorLog(err_str);
        }
        if (protocol) {
            var type = protocol.type;
            Commands_1.commands.receiver(type, protocol, this);
        }
    }
    aginConnect() {
        if (this.chatWs) {
            this.chatWs = undefined;
        }
        if (this.try_agin < this.try_connect_count) {
            this.try_agin++;
            if (this.try_agin_id) {
                clearTimeout(this.try_agin_id);
            }
            this.try_agin_id = setTimeout(() => {
                this.connect();
            }, 3000);
        }
        else {
            var err_str = `网关服务器链接断开！重试了${this.try_connect_count}次，还是不行。`;
            Log_1.Log.errorLog(err_str);
        }
    }
    onClose(code, reason) {
        this.isAlive = false;
        this.aginConnect();
    }
    onPing(data) {
        if (this.chatWs && this.isAlive) {
            this.chatWs.pong();
            Log_1.Log.debug(`socket receive ping`);
        }
    }
    send(protocol) {
        if (this.chatWs && this.chatWs.readyState === WebSocket.OPEN) {
            var source = JSON.stringify(protocol);
            try {
                this.chatWs.send(source);
            }
            catch (e) {
                var msg = e.stack ? e.stack : e.message;
                Log_1.Log.errorLog(msg);
            }
        }
    }
    joinChannel(channelName) {
        Commands_1.commands.send(IProtocol_1.IProtocolType.joinChannel, this, channelName);
    }
    levelChannel(channelName) {
        Commands_1.commands.send(IProtocol_1.IProtocolType.levelChannel, this, channelName);
    }
    msg() {
        return new Message(this);
    }
}
exports.ChatClient = ChatClient;
class Message {
    constructor(cli) {
        this.client = cli;
        this.protocol = {
            id: cli.opts.userId,
            in_product: cli.opts.product,
            in_char_svr: cli.chat_svr.svr_name,
            type: IProtocol_1.IProtocolType.message
        };
    }
    toSvr(svrName) {
        this.protocol.to_chat_svr = svrName;
        return this;
    }
    toChannel(channelName) {
        this.protocol.to_channel = channelName;
        return this;
    }
    toProduct(product) {
        this.protocol.to_product = product;
        return this;
    }
    toId(uid) {
        this.protocol.toid = uid;
        return this;
    }
    send() {
        this.client && this.client.send(this.protocol);
    }
}
exports.Message = Message;
//# sourceMappingURL=ChatClient.js.map