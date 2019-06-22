import { IProtocol, IProtocolType, IChannelBody, IRegisterBody, IStatusBody, IWatchBody } from "chatcommon/src/IProtocol";
import { ChatClient } from "../chatServer/ChatClient";
import { isObject } from "util";
import { product } from "../chatServer/Product";
import { SimpleCommand } from "chatcommon/src/Commands";
import { iSocket } from "chatcommon/src/iSocket";


/**
 * 客户端 ws 接入 加入聊天服务
 */
export class WatchCommond extends SimpleCommand {
    constructor() { super() }
    receiver(protocol: IProtocol, socket: iSocket): void {
        var type: number = protocol.type;
        switch (type) {
            case IProtocolType.watch:
                var body: IWatchBody = protocol.msg_body;
                var cli: ChatClient = <ChatClient>socket;
                if (cli) {
                    cli.watchBody = body;
                    product.addClient(cli);
                    //返回客户端链接成功
                    let ok: IProtocol = { type: IProtocolType.watchOk, in_char_svr: protocol.in_char_svr, in_product: protocol.in_product, id: protocol.id, msg_body: body };
                    cli.send(ok);
                }
                break;
            default:
                break;
        }
    }

    send(type: number, socket?: iSocket, ...args: any[]) { }
}