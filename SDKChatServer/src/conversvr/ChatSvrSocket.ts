
import fs = require("fs");

import { Log } from "chatcommon/src/log/Log";
import WebSocket = require("ws");
import { IRegisterBody, IProtocolType, IProtocol, IWatchBody, BaseResp } from "chatcommon/src/IProtocol";

import { SimpleCommand, commands } from "chatcommon/src/Commands";
import { iSocket } from "chatcommon/src/iSocket";
import { ConvertSocket } from "./ConvertSocket";
import { svrMap } from "./Map";
import { httpRequest } from "chatcommon/src/http/http";
import { appGlobal } from "../../app";


// "gateway_url":"http://127.27.8.15:8090/chatServer/get",
//     "product":"test",
//     "auth":"12306"


/**
 * 连上chatSvr的socket 客户端
 */
export class ChatSvrSocket implements iSocket {
    /**
     * 
     */
    ws:WebSocket;
    /** 是否激活 */
    private isAlive: boolean = false;

    /**断线之后重试连接次数 */
    private try_connect_count: number = 5;   //重试的次数
    private try_agin: number = 0;            //当前重试的次数
    private try_agin_id:NodeJS.Timer

    /**接入的服务器信息 */
    chat_svr:IRegisterBody;

    /** * 客户端的socket */
    convert_cli:ConvertSocket;

    constructor(convertCli:ConvertSocket){
        this.convert_cli = convertCli;
        this.getChatSvr();
    }

    /**
     * 获取分配的服务器
     */
    async getChatSvr() {
        let watch:IWatchBody = this.convert_cli.watchBody;
        const url:string = appGlobal.config.APIGatewayUrl;
        Log.infoLog(`post url ${url}`);
        httpRequest.post(url,{form:{product:watch.product,auth:watch.auth}})
            .then((data:any)=>{
                var res = JSON.parse(data);
                if(res.success) {
                    watch.svr = res.data;       
                    this.chat_svr = res.data;
                    this.connect();
                }
                else {
                    this.convert_cli.forceClose();
                    Log.infoLog(`post request:${data}`);
                }
            })
            .catch((err:any)=>{
                this.convert_cli.forceClose();
                Log.errorLog(err && JSON.stringify(err));
            })
    }

    connect():void {
        if(this.chat_svr) {
            var host:string = this.chat_svr.ip;
            var port:number = this.chat_svr.port;
            var url:string = host + (port > 0 ? `:${port}` : "");
            this.ws = new WebSocket(url);
            Log.debug(`connect to ${url}`);
            this.ws.on("open", this.onOpen.bind(this));
            this.ws.on("message", this.onMessage.bind(this));
            this.ws.on("error", this.onError.bind(this));
            this.ws.on("close", this.onClose.bind(this));
            this.ws.on("ping", this.onPing.bind(this));
        }
    }

    private onError( error: Error): void {
        var err_str:string | undefined = error && error.stack ? error.stack : error.message;
        var msg: string = `ws error msg:${err_str}`;
        Log.errorLog(msg);
    }

    private onOpen(): void {
        var host:string = this.chat_svr.ip;
        var port:number = this.chat_svr.port;
        var url:string =  host + (port > 0 ? `:${port}` : "");
        Log.debug(`connect succeed ${url}`);

        this.isAlive = true;
        this.try_agin = 0;

        let protocol:IProtocol = {
            type:IProtocolType.watch,
            msg_body:this.convert_cli.watchBody,
            in_char_svr:this.chat_svr.svr_name,
            id:this.convert_cli.watchBody.userId,
            in_product:this.convert_cli.watchBody.product
        };

        Log.infoLog("转发链接聊天服务" + JSON.stringify(protocol));
        this.send(protocol);
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
            if(protocol.type === IProtocolType.watchOk) {
                svrMap[this.convert_cli.watchBody.userId] = this.convert_cli;
            }
            this.convert_cli.send(protocol);
        }
    }

    /** * 断线之后重新链接 */
    private aginConnect():void {
        if(this.ws) { this.ws = undefined; }
        if(this.try_agin < this.try_connect_count) {
            this.try_agin++;
            if(this.try_agin_id) {
                clearTimeout(this.try_agin_id);
                this.try_agin_id = null;
            }
            this.try_agin_id = setTimeout(()=>{
                this.connect();
            },3000);
        }
        else {
            
            if(this.convert_cli) {
                this.convert_cli.forceClose();
            }

            svrMap.delete(this.convert_cli.watchBody.userId);
            var err_str:string = `网关服务器链接断开！重试了${this.try_connect_count}次，还是不行。`
            Log.errorLog(err_str);
        }
    }

    private onClose(code: number, reason: string): void {
        this.isAlive = false;
        this.aginConnect();
    }

    private onPing(data: Buffer) {
        if (this.ws && this.isAlive) {
            this.ws.pong();
            // Log.debug(`socket receive ping`);
        }
    }

    /** * 强制断开 */
    forceClose():void {
        this.isAlive = false;
        this.try_agin = this.try_connect_count;
        if(this.try_agin_id) {
            clearTimeout(this.try_agin_id);
            this.try_agin_id = null;
        }
        
        if(this.ws && this.ws.readyState != WebSocket.CLOSED) {
            this.ws.close();
        }
        svrMap.delete(this.convert_cli.watchBody.userId);
    }

    send(protocol:IProtocol){
        if(this.ws && this.ws.readyState === WebSocket.OPEN) {
            var source:string = JSON.stringify(protocol);
            try {
                this.ws.send(source);
            }
            catch(e) {
                var msg:string = e.stack ? e.stack : e.message;
                Log.errorLog(msg);
            }
        }
    }
}