
import WebSocket = require("ws");
import { Log } from "chatcommon/src/log/Log";
import { IWatchBody, IProtocol, IProtocolType } from "chatcommon/src/IProtocol";
import { commands } from "chatcommon/src/Commands";
import { ChatSvrSocket } from "./ChatSvrSocket";
import { debug } from "util";
import { platRedis } from "../PlatRedis";
import { Constant } from "../Constant";

/**
 * 连上转发服务的客户端
 */
export class ConvertSocket {
    /**关注的聊天服务 */
    watchBody:IWatchBody ;
    
    /**客户端socket */
    ws:WebSocket;
    /**
     * 客户端连上来的时候的心跳维系
     */
    private pingTimeOut:NodeJS.Timeout;

    /** 连上chatSvr的socket */
    private svrSocket:ChatSvrSocket;

    constructor(socket:WebSocket){
        if(socket) {
            Log.debug("create a websocket.....");
            this.heartPingPong();
            this.ws = socket;
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
        this.pingTimeOut = setTimeout(()=>{ this.ws.ping(); },checkTime)
    }

    async onMessage(data: WebSocket.Data) {
        try {
            var protocol:IProtocol = JSON.parse(String(data));
            if(protocol.type !== IProtocolType.watch && !this.watchBody) {
                const msg:string = `非法连接 断开处理`
                Log.infoLog(msg);
                this.forceClose();
                return;
            }
            else if(protocol.type === IProtocolType.watch && !this.watchBody) {
                this.watchBody = protocol.msg_body;
                
                const token:string = await platRedis.redisCli.getString(Constant.REDIS_TOKEN + this.watchBody.userId);
                if(token === this.watchBody.token) {
                    this.svrSocket = new ChatSvrSocket(this);
                }
                else {
                    Log.errorLog(`认证没通过 Token :${this.watchBody.token}`);
                    this.forceClose();
                }
            }
            else {
                if(this.svrSocket) {
                    this.svrSocket.send(protocol);
                }
                else {
                    Log.errorLog(`聊天服务还没有建立无法处理消息:${JSON.stringify(protocol)}`);
                }
            }
            Log.infoLog(String(data));
            
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
        if(this.svrSocket) {
            this.svrSocket.forceClose();
        }
    }

    forceClose():void {
        if(this.pingTimeOut)  {
            clearTimeout(this.pingTimeOut); 
            this.pingTimeOut = undefined;
        }
        if(this.ws && this.ws.readyState != WebSocket.CLOSED) {
            this.ws.close();
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