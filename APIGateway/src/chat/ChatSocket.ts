/**
 * 聊天服务器链接接入进来的客户端
 */
import WebSocket = require("ws");
import { Log } from "chatcommon/src/log/Log";
import { chatIo, svrCache } from "./ChatIO";
import { clearTimeout, setTimeout } from "timers";
import { IRegisterBody, IStatusBody, IProtocol } from "chatcommon/src/IProtocol";
import { commands } from "chatcommon/src/Commands";
import { IMiddleware } from "koa-router";

export class ChatSocket {
    
    svr_name:string = "";
    svr_status:IStatusBody;                      //当前聊天服务器的状态
    svr_register:IRegisterBody ;                 //聊天服务器的注册信息
    sc: WebSocket;                               //聊天服务器的socket
    private pingTimeOut:NodeJS.Timeout ;
    
    constructor(socket: WebSocket) {
        this.sc = socket;
        if(socket) {
            this.heartPingPong();
            socket.on("message", this.onMessage.bind(this));
            socket.on("close", this.onClose.bind(this));
            socket.on("error", this.onError.bind(this));
            socket.on("pong", this.onPong.bind(this));
        }
    }

    /**心跳维系 */
    private heartPingPong():void {
        if(this.pingTimeOut) { 
            clearTimeout(this.pingTimeOut); 
            this.pingTimeOut = undefined;
        }
        var checkTime:number = 10000;
        this.pingTimeOut = setTimeout(()=>{ this.sc.ping(); },checkTime)
    }

    onMessage(data: WebSocket.Data): void {
        try {
            var protocol:IProtocol = JSON.parse(String(data));
            commands.receiver(protocol.type,protocol,this);
        }
        catch {
            var msg:string = "parse protocol error";
            Log.errorLog(msg);
        }
    }

    onClose(code: number, reson: string): void {
        if(this.pingTimeOut) { 
            clearTimeout(this.pingTimeOut); 
            this.pingTimeOut = undefined;
        }
        chatIo.removeClient(this.svr_name);
        
        //删除缓存
        var caches = svrCache;
        for(var i = 0; i < caches.keys.length; i++) {
            var key = caches.keys[i];
            if(caches[key] == this.svr_register) {
                caches.delete(key);
                break;
            }
        }
    }

    onError(error: Error): void {
        var msg:string = error.stack ? error.stack : error.message;
        Log.errorLog(msg);
    }

    onPong(data: Buffer) {
        this.heartPingPong();
    }

    send(protocol:IProtocol):void {
        if(this.sc && this.sc.readyState === WebSocket.OPEN) {
            var source:string = JSON.stringify(protocol);
            try {
                this.sc.send(source);
            }
            catch(e) {
                var msg:string = e.stack ? e.stack : e.message;
                Log.errorLog(msg);
            }
        }
    }
}