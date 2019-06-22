import { IProtocol, IProtocolType, IChannelBody, IRegisterBody, IStatusBody } from "chatcommon/src/IProtocol";
import WebSocket = require("ws");
import { IConfig } from "../conf/IConfig";
import { gatewayClient } from "../gateway/GatewayClient";
import { product } from "../chatServer/Product";
import { appGlobal } from "../../app";
import { SimpleCommand, commands } from "chatcommon/src/Commands";
import { iSocket } from "chatcommon/src/iSocket";
import { Log } from "chatcommon/src/log/Log";
import { localIP } from "chatcommon/src/os/GetIP";


/**
 * 注册道网关服务器
 */

export class RegisterCommond extends SimpleCommand {
    constructor(){super()}
    receiver(protocol:IProtocol,socket:iSocket):void {
        var type:number = protocol.type;
        switch(type) {
            //网关连接成功
            case IProtocolType.registerSucceed:                                                 
                gatewayClient.onRegisterSucceed();
                Log.debug("gateway connect succeed");
                Log.infoLog("--------------------- gateway connect succeed");
            break;
        }
    }

    send(type:number,socket?:iSocket,...args:any[]){
        let config:IConfig | undefined = appGlobal.config;
        switch(type) {
            //发送链接网关
            case IProtocolType.register:                                                        
            if(socket) {
                if(config) {
                    const host:string = config.chat_host ? config.chat_host : `ws://${localIP()}`;
                    const port:number = config.chat_port ? config.chat_port : Number(appGlobal.defaultPort || 8090);
                    let registerBody:IRegisterBody = {
                        ip:host,
                        port:port,
                        svr_name:config.svr_name
                    }
                    let registerProtocol:IProtocol = {
                        type:IProtocolType.register,
                        in_char_svr:config.svr_name,
                        msg_body:registerBody,
                        in_product:"",
                        id:"",
                    }
                    socket.send(registerProtocol);
                    //链接道网关服务之后立即发送状态服务
                    commands.send(IProtocolType.status,socket);
                }
            }
            break;
            //同步网关状态
            case IProtocolType.status:
                if(socket) {
                    if(config) {
                        var statusBody:IStatusBody = product.getStatus();
                        let statusProtocol:IProtocol = {
                            type:IProtocolType.status,
                            msg_body:statusBody,
                            in_char_svr:config.svr_name,
                            in_product:"",
                            id:"",
                        }
                        socket.send(statusProtocol);
                    }
                }
            break;
        }
    }
}