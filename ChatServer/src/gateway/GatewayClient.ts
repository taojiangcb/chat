import WebSocket = require("ws");
import { IProtocol, IProtocolType } from "chatcommon/src/IProtocol";
import { Log } from "chatcommon/src/log/Log"
import { IConfig } from "../conf/IConfig";
import { commands } from "chatcommon/src/Commands";
import { iSocket } from "chatcommon/src/iSocket";

import { setTimeout, clearTimeout } from "timers";
import { RegisterCommond } from "../commonds/RegisterCommond";
import { appGlobal } from "../../app";

export class GatewayClient implements iSocket {
    
    //网关转发
    private gatewayWS: WebSocket | undefined;

    /** 是否注册成功 */
    private registerSucceed: boolean = false;

    /** 是否激活 */
    private isAlive: boolean = false;

    /**断线之后重试连接次数 */
    private try_connect_count: number = 5;                                  //重试的次数
    private try_agin: number = 0;                                           //当前重试的次数
    private try_agin_id:NodeJS.Timer | undefined

    constructor() {
        var registerCommand = new RegisterCommond();
        commands.register(IProtocolType.register,registerCommand);
        commands.register(IProtocolType.registerSucceed,registerCommand);
        commands.register(IProtocolType.status,registerCommand);
    }

    connect(): void {
        var cfg: IConfig  = appGlobal.config;
        if (cfg) {
            var host: string = cfg.gateway_host;
            var port: number = cfg.gateway_port;
            var url:string = host + (port > 0 ? `:${port}` : "");
            Log.debug(url);
            this.gatewayWS = new WebSocket(url);
            this.gatewayWS.on("open", this.onOpen.bind(this));
            this.gatewayWS.on("message", this.onMessage.bind(this));
            this.gatewayWS.on("error", this.onError.bind(this));
            this.gatewayWS.on("close", this.onClose.bind(this));
            this.gatewayWS.on("ping", this.onPing.bind(this));
            Log.debug("connect gateway...");
        }
    }

    onRegisterSucceed():void {
        this.registerSucceed = true;
    }

    /**
     * 网关协议消息转发
     * @param protocol 
     */
    send(protocol: IProtocol) {
        var type:number = protocol.type;
        switch(type) {
            case IProtocolType.message:
                this.gatewaySend(protocol);
            default:
                var protocol_str: string = JSON.stringify(protocol);
                if (this.gatewayWS) {
                    try {
                        if (this.gatewayWS.readyState == WebSocket.OPEN) {
                            this.gatewayWS.send(protocol_str);
                        }
                        else {
                            var msg: string = `state not open : ${protocol_str}`;
                            Log.errorLog(msg);
                        }
                    }
                    catch (e) {
                        var err_str: string = e.stack ? e.stack : e.message;
                        Log.errorLog(err_str);
                    }
                }
        }
    }

    private onError( error: Error): void {
        var err_str:string | undefined = error && error.stack ? error.stack : error.message;
        var msg: string = `ws error msg:${err_str}`;
        Log.errorLog(msg);
    }

    private onOpen(): void {
        this.isAlive = true;
        this.try_agin = 0;
        commands.send(IProtocolType.register, this);
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
            commands.receiver(protocol.type,protocol,this)
        }
    }

     /**
     * 断线之后重新链接
     */
    private aginConnect():void {
        if(this.gatewayWS) { this.gatewayWS = undefined; }
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
        this.registerSucceed = false;
        this.aginConnect();
    }

    private onPing(data: Buffer) {
        if (this.gatewayWS && this.isAlive) {
            this.gatewayWS.pong();
            /**发送状态消息 */
            commands.send(IProtocolType.status, this)
            Log.debug(`socket receive ping`);
        }
    }

    /**
     * @param protocol 消息转发
     */
    private gatewaySend(protocol: IProtocol):void {
        const in_svr: string = protocol.in_char_svr;
        const to_svr: string | undefined = protocol.to_chat_svr;
        var protocol_str: string = JSON.stringify(protocol);

        if(!this.isAlive || !this.registerSucceed) {
            Log.errorLog("网关服务还没被注入成功，不能转发消息。");
            return;
        }

        if (to_svr && in_svr !== to_svr) {
            if (this.gatewayWS) {
                try {
                    if (this.gatewayWS.readyState == WebSocket.OPEN) {
                        this.gatewayWS.send(protocol_str);
                    }
                    else {
                        var msg: string = `state not open : ${protocol_str}`;
                        Log.errorLog(msg);
                    }
                }
                catch (e) {
                    var err_str: string = e.stack ? e.stack : e.message;
                    Log.errorLog(err_str);
                }
            }
        }
        else {
            var msg: string = `转发消息协议无效:${protocol_str}`;
            Log.errorLog(msg);
        }
    }
}

export var gatewayClient = new GatewayClient();