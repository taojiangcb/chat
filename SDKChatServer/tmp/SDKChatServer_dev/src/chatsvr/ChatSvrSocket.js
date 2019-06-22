"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = require("chatcommon/src/log/Log");
const WebSocket = require("ws");
const IProtocol_1 = require("chatcommon/src/IProtocol");
const Map_1 = require("../map/Map");
class ChatSvrSocket {
    constructor(convertCli, svrInfo) {
        this.isAlive = false;
        this.try_connect_count = 5;
        this.try_agin = 0;
        this.convert_cli = convertCli;
        this.chat_svr = svrInfo;
        this.connect();
    }
    connect() {
        if (this.chat_svr) {
            console.log(this.chat_svr);
            var host = this.chat_svr.ip;
            var port = this.chat_svr.port;
            var url = "ws://" + host + (port > 0 ? `:${port}` : "");
            this.ws = new WebSocket(url);
            this.ws.on("open", this.onOpen.bind(this));
            this.ws.on("message", this.onMessage.bind(this));
            this.ws.on("error", this.onError.bind(this));
            this.ws.on("close", this.onClose.bind(this));
            this.ws.on("ping", this.onPing.bind(this));
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
        let protocol = {
            type: IProtocol_1.IProtocolType.watch,
            msg_body: this.convert_cli.watchBody,
            in_char_svr: this.chat_svr.svr_name
        };
        this.send(protocol);
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
            if (protocol.type === IProtocol_1.IProtocolType.watchOk) {
                Map_1.svrMap[this.convert_cli.watchBody.userId] = this.convert_cli;
            }
            this.convert_cli.send(protocol);
        }
    }
    aginConnect() {
        if (this.ws) {
            this.ws = undefined;
        }
        if (this.try_agin < this.try_connect_count) {
            this.try_agin++;
            if (this.try_agin_id) {
                clearTimeout(this.try_agin_id);
                this.try_agin_id = null;
            }
            this.try_agin_id = setTimeout(() => {
                this.connect();
            }, 3000);
        }
        else {
            if (this.convert_cli) {
                this.convert_cli.forceClose();
            }
            Map_1.svrMap.delete(this.convert_cli.watchBody.userId);
            var err_str = `网关服务器链接断开！重试了${this.try_connect_count}次，还是不行。`;
            Log_1.Log.errorLog(err_str);
        }
    }
    onClose(code, reason) {
        this.isAlive = false;
        this.aginConnect();
    }
    onPing(data) {
        if (this.ws && this.isAlive) {
            this.ws.pong();
            Log_1.Log.debug(`socket receive ping`);
        }
    }
    forceClose() {
        this.isAlive = false;
        this.try_agin = this.try_connect_count;
        if (this.try_agin_id) {
            clearTimeout(this.try_agin_id);
            this.try_agin_id = null;
        }
        if (this.ws.readyState != WebSocket.CLOSED) {
            this.ws.close();
        }
        Map_1.svrMap.delete(this.convert_cli.watchBody.userId);
    }
    send(protocol) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            var source = JSON.stringify(protocol);
            try {
                this.ws.send(source);
            }
            catch (e) {
                var msg = e.stack ? e.stack : e.message;
                Log_1.Log.errorLog(msg);
            }
        }
    }
}
exports.ChatSvrSocket = ChatSvrSocket;
//# sourceMappingURL=ChatSvrSocket.js.map