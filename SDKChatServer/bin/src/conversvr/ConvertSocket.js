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
const WebSocket = require("ws");
const Log_1 = require("chatcommon/src/log/Log");
const IProtocol_1 = require("chatcommon/src/IProtocol");
const ChatSvrSocket_1 = require("./ChatSvrSocket");
const PlatRedis_1 = require("../PlatRedis");
const Constant_1 = require("../Constant");
class ConvertSocket {
    constructor(socket) {
        if (socket) {
            Log_1.Log.debug("create a websocket.....");
            this.heartPingPong();
            this.ws = socket;
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
        this.pingTimeOut = setTimeout(() => { this.ws.ping(); }, checkTime);
    }
    onMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var protocol = JSON.parse(String(data));
                if (protocol.type !== IProtocol_1.IProtocolType.watch && !this.watchBody) {
                    const msg = `非法连接 断开处理`;
                    Log_1.Log.infoLog(msg);
                    this.forceClose();
                    return;
                }
                else if (protocol.type === IProtocol_1.IProtocolType.watch && !this.watchBody) {
                    this.watchBody = protocol.msg_body;
                    const token = yield PlatRedis_1.platRedis.redisCli.getString(Constant_1.Constant.REDIS_TOKEN + this.watchBody.userId);
                    if (token === this.watchBody.token) {
                        this.svrSocket = new ChatSvrSocket_1.ChatSvrSocket(this);
                    }
                    else {
                        Log_1.Log.errorLog(`认证没通过 Token :${this.watchBody.token}`);
                        this.forceClose();
                    }
                }
                else {
                    if (this.svrSocket) {
                        this.svrSocket.send(protocol);
                    }
                    else {
                        Log_1.Log.errorLog(`聊天服务还没有建立无法处理消息:${JSON.stringify(protocol)}`);
                    }
                }
                Log_1.Log.infoLog(String(data));
            }
            catch (_a) {
                var msg = "parse protocol error";
                Log_1.Log.errorLog(msg);
            }
        });
    }
    onClose(code, reson) {
        if (this.pingTimeOut) {
            clearTimeout(this.pingTimeOut);
            this.pingTimeOut = undefined;
        }
        if (this.svrSocket) {
            this.svrSocket.forceClose();
        }
    }
    forceClose() {
        if (this.pingTimeOut) {
            clearTimeout(this.pingTimeOut);
            this.pingTimeOut = undefined;
        }
        if (this.ws && this.ws.readyState != WebSocket.CLOSED) {
            this.ws.close();
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
exports.ConvertSocket = ConvertSocket;
