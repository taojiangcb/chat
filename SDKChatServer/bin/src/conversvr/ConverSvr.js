"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const app_1 = require("../../app");
const Log_1 = require("chatcommon/src/log/Log");
const ConvertSocket_1 = require("./ConvertSocket");
class ConverSvr {
    constructor() {
        this.start();
    }
    start() {
        let config = app_1.appGlobal.config;
        if (config) {
            const port = config.WSPort;
            this.ws_server = new WebSocket.Server({ port: port });
            this.ws_server.on("connection", this.onConnection.bind(this));
            this.ws_server.on("error", this.onError.bind(this));
            Log_1.Log.debug("start ConverSvr port:" + port);
        }
    }
    onConnection(socket, require) {
        Log_1.Log.debug(`connect a ws`);
        new ConvertSocket_1.ConvertSocket(socket);
    }
    onError(error) {
        var msg = error.stack ? error.stack : error.message;
        Log_1.Log.errorLog(msg);
    }
}
exports.ConverSvr = ConverSvr;
