import WebSocket = require("ws");
import http = require("http");
import { IProtocol, IProtocolType, IChannelBody, IRegisterBody, IStatusBody } from "chatcommon/src/IProtocol";
import { WatchCommond } from "../commonds/WatchCommond";
import { MessageCommand } from "../commonds/MessageCommand";
import { localIP } from "chatcommon/src/os/GetIP";
import { Log } from "chatcommon/src/log/Log";
import { ChatClient } from "./ChatClient";
import { ChannelCommond } from "../commonds/ChannelCommand";
import { appGlobal } from "../../app";
import { commands } from "chatcommon/src/Commands";

export class ChatServer {

    httpsvr:http.Server;
    ws:WebSocket.Server;
    config = appGlobal.config;

    constructor() { 

        var channelCmd = new ChannelCommond();
        
        commands.register(IProtocolType.watch,new WatchCommond());                  //客户端注入进来
        commands.register(IProtocolType.message,new MessageCommand());              //聊天消息协议
        commands.register(IProtocolType.joinChannel,channelCmd);                    //进入聊天频道
        commands.register(IProtocolType.levelChannel,channelCmd);                   //退出聊天频道

        if(!this.config) {
            var msg:string = "config is error";
            throw new Error(msg);
        }

        const port:number = this.config.chat_port;
        
        this.ws = new WebSocket.Server({port:port});
        this.ws.on("connection",this.onConnection.bind(this));
        this.ws.on("error",this.onError.bind(this));
        Log.debug("start chatServer port:" + port);
    }

    onConnection(socket:WebSocket,require:http.IncomingHttpHeaders):void {
        new ChatClient(socket);
    }

    onError(event:string):void {
        Log.errorLog(event);
    }
}

