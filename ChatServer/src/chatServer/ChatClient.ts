
import WebSocket = require("ws");
import { Log } from "chatcommon/src/log/Log";
import { IWatchBody, IProtocol, IProtocolType } from "chatcommon/src/IProtocol";
import { commands } from "chatcommon/src/Commands";
import { product } from "./Product";

export class ChatClient {

    /** */
    watchBody:IWatchBody | undefined;
    sc:WebSocket;
    private pingTimeOut:NodeJS.Timeout | undefined;

    constructor(socket:WebSocket){
        if(socket) {
            this.heartPingPong();
            this.sc = socket;
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
            if(protocol.type !== IProtocolType.watch && !this.watchBody) {
                const msg:string = `非法连接 断开 userid:${protocol.id}`
                Log.infoLog(msg);
                this.sc.close();
                //非法链接
                return;
            }
            commands.receiver(protocol.type,protocol,this);
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
        if(this.watchBody) {
            product.removeClient(this.watchBody.userId,this.watchBody.product);
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
            try {
                var source:string = JSON.stringify(protocol);
                this.sc.send(source);
                Log.infoLog(`${protocol.id} send msg:${source}`);
            }
            catch(e) {
                var msg:string = e.stack ? e.stack : e.message;
                Log.errorLog(msg);
            }
        }
    }
}