
import fs = require("fs");

import { Log } from "chatcommon/src/log/Log";
import WebSocket = require("ws");
import { IRegisterBody, IProtocolType, IProtocol, IWatchBody } from "chatcommon/src/IProtocol";
import {httpRequest} from "chatcommon/src/http/http";

import { SimpleCommand, commands } from "chatcommon/src/Commands";
import { iSocket } from "chatcommon/src/iSocket";
import { MessageCommon } from "./MessageCommon";
import { WatchCommon } from "./WatchCommond";
import { ChannelCommand } from "./ChannelCommand";


// "gateway_url":"http://127.27.8.15:8090/chatServer/get",
//     "product":"test",
//     "auth":"12306"

export type ConnectOpts = {
    gateway_url:string,
    product:string,
    auth:string,
    userId:string,
}

export class TestChatSvrSocket implements iSocket {

    opts:ConnectOpts;
    chatWs:WebSocket;

    /** 是否激活 */
    private isAlive: boolean = false;

    /**断线之后重试连接次数 */
    private try_connect_count: number = 5;   //重试的次数
    private try_agin: number = 0;            //当前重试的次数
    private try_agin_id:NodeJS.Timer | undefined

    /**接入得服务器信息 */
    chat_svr:IRegisterBody;

    constructor(opt?:ConnectOpts){
        
        this.opts = opt;
        
        var channelCmd:ChannelCommand = new ChannelCommand();
        commands.register(IProtocolType.watch,new WatchCommon());
        commands.register(IProtocolType.joinChannel,channelCmd);
        commands.register(IProtocolType.levelChannel,channelCmd);

        this.getChatSvr();
        // this.connect();
    }

    /**
     * 获取ChatSvr 链接服务器
     */
    async getChatSvr() {
        try {
            this.chat_svr = <IRegisterBody>await httpRequest.post(this.opts.gateway_url,{formData:this.opts});
        }
        catch(e) {
            Log.errorLog(e.stack || e.message);
        }
        if(this.chat_svr) {
            this.connect();
        }
    }

    connect():void {

        var host:string = `172.27.8.15`;
        var port:number = 8091;
        var url:string = "ws://" + host + (port > 0 ? `:${port}` : "");
        this.chatWs = new WebSocket(url);

        this.chatWs.on("open", this.onOpen.bind(this));
        this.chatWs.on("message", this.onMessage.bind(this));
        this.chatWs.on("error", this.onError.bind(this));
        this.chatWs.on("close", this.onClose.bind(this));
        this.chatWs.on("ping", this.onPing.bind(this));
    }

    private onError( error: Error): void {
        var err_str:string | undefined = error && error.stack ? error.stack : error.message;
        var msg: string = `ws error msg:${err_str}`;
        Log.errorLog(msg);
    }

    private onOpen(): void {
        this.isAlive = true;
        this.try_agin = 0;

        Log.log("client is a connect...." + this);

        //发送watch 聊天服务
        commands.send(IProtocolType.watch,this);
    }

    private onMessage(data: WebSocket.Data): void { 
        var protocol:IProtocol |undefined;
        try {
            protocol = <IProtocol>JSON.parse(String(data));
        }
        catch(e) {
            const err_str:string = e && e.stack ? e.stack : e.message;
            Log.errorLog(err_str);
        }
        if(protocol) {
            var type:number = protocol.type;
            commands.receiver(type,protocol,this)
            Log.infoLog(`receiver data:${data}`);
        }
    }

    /** * 断线之后重新链接 */
    private aginConnect():void {
        if(this.chatWs) { this.chatWs = undefined; }
        if(this.try_agin < this.try_connect_count) {
            this.try_agin++;
            if(this.try_agin_id) {
                clearTimeout(this.try_agin_id);
            }
            this.try_agin_id = setTimeout(()=>{
                this.connect();
            },3000);
        }
        else {
            var err_str:string = `网关服务器链接断开！重试了${this.try_connect_count}次，还是不行。`
            Log.errorLog(err_str);
        }
    }

    private onClose(code: number, reason: string): void {
        this.isAlive = false;
        this.aginConnect();
    }

    private onPing(data: Buffer) {
        if (this.chatWs && this.isAlive) {
            this.chatWs.pong();
            Log.debug(`socket receive ping`);
        }
    }

    send(protocol:IProtocol){
        if(this.chatWs && this.chatWs.readyState === WebSocket.OPEN) {
            var source:string = JSON.stringify(protocol);
            try {
                this.chatWs.send(source);
            }
            catch(e) {
                var msg:string = e.stack ? e.stack : e.message;
                Log.errorLog(msg);
            }
        }
    }

    /**
     * 加入房间
     * @param channelName 
     */
    joinChannel(channelName:string):void {
        commands.send(IProtocolType.joinChannel,this,channelName);
    }
    /**
     * 离开房间
     * @param channelName 
     */
    levelChannel(channelName:string):void {
        commands.send(IProtocolType.levelChannel,this,channelName);
    }

    msg():Message {
        return new Message(this);
    }
}

export class Message {
    private protocol:IProtocol;
    private client:TestChatSvrSocket;
    constructor(cli:TestChatSvrSocket){
        this.client = cli;
        this.protocol = {
            id:cli.opts.userId,
            in_product:cli.opts.product,
            in_char_svr:cli.chat_svr.svr_name,
            type:IProtocolType.message
        }
    }

    /**转发到其他服务器 */
    toSvr(svrName:string):Message {
        this.protocol.to_chat_svr = svrName;
        return this;
    }

    /**发送到其他频道 */
    toChannel(channelName:string):Message {
        this.protocol.to_channel = channelName;
        return this;
    }

    /**发送到其他游戏产品 */
    toProduct(product:string):Message {
        this.protocol.to_product = product;
        return this;
    }

    /**私聊 */
    toId(uid:string):Message {
        this.protocol.toid = uid;
        return this;
    }

    /**消息发送 */
    send():void{
        this.client && this.client.send(this.protocol);
    }
}