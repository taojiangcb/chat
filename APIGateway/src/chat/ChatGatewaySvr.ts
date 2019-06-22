import WebSocket = require("ws");
import http = require("http");
import { appGlobal } from "../../app";
import { IConfig } from "../conf/IConfig";
import { ChatSocket } from "./ChatSocket";
import { RegisterCommond } from "./commonds/RegisterCommond";
import { MessageCommand } from "./commonds/MessageCommond";
import { Log } from "chatcommon/src/log/Log";
import {Server} from "net";
import { IProtocolType } from "chatcommon/src/IProtocol";
import { commands } from "chatcommon/src/Commands";
import { strictEqual } from "assert";

export class ChatGatewaySvr {

    config = appGlobal.config ? appGlobal.config : null;
    wss:WebSocket.Server;

    constructor() {

        var register_command = new RegisterCommond();
        commands.register(IProtocolType.register,register_command);
        commands.register(IProtocolType.status,register_command);
        commands.register(IProtocolType.message,new MessageCommand())
        
        if(!this.config) {
            var msg:string = "config is error";
            throw new Error(msg);
        }

        this.wss = new WebSocket.Server({ port: this.config.ws_port });
        this.wss.on("connection", this.onConnection.bind(this));
        this.wss.on("error", this.onError.bind(this));
        
        // this.server = http.createServer();
        // this.server.on("upgrade", (request,socket,head)=>{ 
        //     this.wss.handleUpgrade(request, socket, head, function done(ws) {
        //         ws.emit('connection', ws, request);
        //     });
        // })
        // this.server.listen({ port: this.config.ws_port });
    }

    onConnection(socket: WebSocket, require: http.IncomingHttpHeaders): void {
        new ChatSocket(socket);
    }
   
    onError(socket: WebSocket, error: Error): void {
        var msg:string = error.stack ? error.stack : error.message;
        Log.errorLog(msg);
    }
}

