import { CommondInterface, commands } from "chatcommon/src/Commands";
import http = require("http");
import WebSocket = require("ws")
import { IConfig } from "../conf/IConfig";
import { appGlobal } from "../../app";
import { Log } from "chatcommon/src/log/Log";
import { ConvertSocket } from "./ConvertSocket";
import { IProtocolType } from "chatcommon/src/IProtocol";

/**
 * 聊天公共的转发服务
 */
export class ConverSvr {

    ws_server:WebSocket.Server;
    constructor(){
        this.start();
    }

    start():void {
        let config:IConfig = appGlobal.config;
        if(config) {
            const port:number = config.WSPort;
            this.ws_server = new WebSocket.Server({port:port});
            this.ws_server.on("connection",this.onConnection.bind(this));
            this.ws_server.on("error",this.onError.bind(this));
            Log.debug("start ConverSvr port:" + port);
        }
    }

    onConnection(socket:WebSocket,require:http.IncomingHttpHeaders):void {
        Log.debug(`connect a ws`);
        new ConvertSocket(socket);
    }

    onError(error):void {
        var msg:string = error.stack ? error.stack : error.message;
        Log.errorLog(msg);
    }
}