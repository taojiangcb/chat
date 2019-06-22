import { SimpleCommand } from "chatcommon/src/Commands";
import { IProtocol, IWatchBody } from "chatcommon/src/IProtocol";
import { iSocket } from "chatcommon/src/iSocket";
import { ChatSvrSocket } from "./ChatSvrSocket";
import { Log } from "chatcommon/src/log/Log";

export class WatchCommon extends SimpleCommand {

    constructor(){super()}

    receiver(protocol:IProtocol,sock:iSocket):void {
        Log.infoLog(`${protocol.id} 连接接入成功..`)
    }

    send(type:number,socket?:iSocket,...args:any[]) {
        let chatClient:ChatSvrSocket = <ChatSvrSocket>socket;
        let watchBody:IWatchBody = {
            product:chatClient.opts.product,
            userId:chatClient.opts.userId,
            token:chatClient.chat_svr.token
        }
        var protocol:IProtocol = {
            type:type,
            in_char_svr:chatClient.chat_svr.svr_name,
            in_product:chatClient.opts.product,
            id:chatClient.opts.userId,
            msg_body:watchBody
        }
        socket.send(protocol);
    }
}