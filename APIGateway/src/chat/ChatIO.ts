/**
 * 所有聊天服务器的socket 句柄管理
 */

import { ChatSocket } from "./ChatSocket";
import WebSocket = require("ws");
import { Log } from "chatcommon/src/log/Log";
import { IProtocol, IRegisterBody } from "chatcommon/src/IProtocol";

/**获取服务时的缓存 */
export var svrCache:Map<string,IRegisterBody> = new Map();

class ChatIO {
    constructor() { }
    
    /**聊天的服务器池 */
    private clients: { [key: string]: ChatSocket } = {};

    /**添加一台服务器 */
    addClient(socket: ChatSocket): void {
        this.clients[socket.svr_name] = socket;
        Log.infoLog(`add svr client [${socket.svr_name}]`);
    }

    /**
     * 
     * @param svr_name 删除一台服务区
     */
    removeClient(svr_name: string): boolean {
        var client: ChatSocket = this.clients[svr_name];
        if (client) {
            if (!client.sc || client.sc.readyState == WebSocket.CLOSED) {
                delete this.clients[svr_name];
                Log.infoLog(`delete svr client [${svr_name}]`);
                return true;
            }
            else {
                return false;
            }
        }
        return true;
    }

    /**
     * 
     * @param svr_name 关闭一台服务器的链接
     */
    closeClient(svr_name: string): void {
        var client: ChatSocket = this.clients[svr_name];
        if (client) {
            client.sc.close();
        }
    }

    /**
     * 所有聊天服务的列表
     */
    allClients(): ChatSocket[] {
        var collection: ChatSocket[] = [];
        for (var key in this.clients) {
            collection.push(this.clients[key]);
        }
        return collection;
    }

    /**
     * 聊天网关转发服务消息
     * @param protocol 
     */
    send(protocol:IProtocol):void {
        var to_server:string = protocol.to_chat_svr || "";
        var tosvrs:string[] = to_server.split("|");
        
        if(!protocol.in_char_svr) {
            var msg:string = `message fail : ${JSON.stringify(protocol)}`;
            Log.errorLog(msg);
            return 
        }

        if(to_server === "") {
            to_server = protocol.in_char_svr;
        }

        /**发送到同服务 */
        if(to_server === protocol.in_char_svr) {
                let client = this.clients[to_server];
                if(client) {
                    client.send(protocol);
                }
                else {
                    Log.errorLog(`服务器不存在无效数据${JSON.stringify(protocol)}`);
                }
                Log.infoLog(`发送到同一台服务器${JSON.stringify(protocol)}`);
        }
        /**同步到多台服务上 */
        else if(tosvrs && tosvrs.length > 0) {
            var len:number = tosvrs.length;
            while(--len > -1) {
                var key = tosvrs[len];
                let client = this.clients[key];
                if(client) {
                    client.send(protocol);
                }
                Log.infoLog(`同步到多台服务上${JSON.stringify(protocol)}`);
            }
        }
        /**广播到所有的服务 */
        else if(to_server === "*") {
            for(var key in this.clients) {
                let client = this.clients[key];
                if(client) {
                    client.send(protocol);
                }
                Log.infoLog(`广播到所有的服务:${JSON.stringify(protocol)}`);
            }
        }
    }
}

export var chatIo = new ChatIO();