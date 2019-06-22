"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const IProtocol_1 = require("chatcommon/src/IProtocol");
const Log_1 = require("chatcommon/src/log/Log");
const Commands_1 = require("chatcommon/src/Commands");
const timers_1 = require("timers");
const RegisterCommond_1 = require("../commonds/RegisterCommond");
const app_1 = require("../../app");
class GatewayClient {
    constructor() {
        this.registerSucceed = false;
        this.isAlive = false;
        this.try_connect_count = 5;
        this.try_agin = 0;
        var registerCommand = new RegisterCommond_1.RegisterCommond();
        Commands_1.commands.register(IProtocol_1.IProtocolType.register, registerCommand);
        Commands_1.commands.register(IProtocol_1.IProtocolType.registerSucceed, registerCommand);
        Commands_1.commands.register(IProtocol_1.IProtocolType.status, registerCommand);
    }
    connect() {
        var cfg = app_1.appGlobal.config;
        if (cfg) {
            var host = cfg.gateway_host;
            var port = cfg.gateway_port;
            var url = host + (port > 0 ? `:${port}` : "");
            Log_1.Log.debug(url);
            this.gatewayWS = new WebSocket(url);
            this.gatewayWS.on("open", this.onOpen.bind(this));
            this.gatewayWS.on("message", this.onMessage.bind(this));
            this.gatewayWS.on("error", this.onError.bind(this));
            this.gatewayWS.on("close", this.onClose.bind(this));
            this.gatewayWS.on("ping", this.onPing.bind(this));
            Log_1.Log.debug("connect gateway...");
        }
    }
    onRegisterSucceed() {
        this.registerSucceed = true;
    }
    send(protocol) {
        var type = protocol.type;
        switch (type) {
            case IProtocol_1.IProtocolType.message:
                this.gatewaySend(protocol);
            default:
                var protocol_str = JSON.stringify(protocol);
                if (this.gatewayWS) {
                    try {
                        if (this.gatewayWS.readyState == WebSocket.OPEN) {
                            this.gatewayWS.send(protocol_str);
                        }
                        else {
                            var msg = `state not open : ${protocol_str}`;
                            Log_1.Log.errorLog(msg);
                        }
                    }
                    catch (e) {
                        var err_str = e.stack ? e.stack : e.message;
                        Log_1.Log.errorLog(err_str);
                    }
                }
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
        Commands_1.commands.send(IProtocol_1.IProtocolType.register, this);
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
            Commands_1.commands.receiver(protocol.type, protocol, this);
        }
    }
    aginConnect() {
        if (this.gatewayWS) {
            this.gatewayWS = undefined;
        }
        if (this.try_agin < this.try_connect_count) {
            this.try_agin++;
            if (this.try_agin_id) {
                timers_1.clearTimeout(this.try_agin_id);
            }
            this.try_agin_id = timers_1.setTimeout(() => {
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
        this.registerSucceed = false;
        this.aginConnect();
    }
    onPing(data) {
        if (this.gatewayWS && this.isAlive) {
            this.gatewayWS.pong();
            Commands_1.commands.send(IProtocol_1.IProtocolType.status, this);
            Log_1.Log.debug(`socket receive ping`);
        }
    }
    gatewaySend(protocol) {
        const in_svr = protocol.in_char_svr;
        const to_svr = protocol.to_chat_svr;
        var protocol_str = JSON.stringify(protocol);
        if (!this.isAlive || !this.registerSucceed) {
            Log_1.Log.errorLog("网关服务还没被注入成功，不能转发消息。");
            return;
        }
        if (to_svr && in_svr !== to_svr) {
            if (this.gatewayWS) {
                try {
                    if (this.gatewayWS.readyState == WebSocket.OPEN) {
                        this.gatewayWS.send(protocol_str);
                    }
                    else {
                        var msg = `state not open : ${protocol_str}`;
                        Log_1.Log.errorLog(msg);
                    }
                }
                catch (e) {
                    var err_str = e.stack ? e.stack : e.message;
                    Log_1.Log.errorLog(err_str);
                }
            }
        }
        else {
            var msg = `转发消息协议无效:${protocol_str}`;
            Log_1.Log.errorLog(msg);
        }
    }
}
exports.GatewayClient = GatewayClient;
exports.gatewayClient = new GatewayClient();
//# sourceMappingURL=GatewayClient.js.map