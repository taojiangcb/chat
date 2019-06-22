import { SimpleCommand } from "chatcommon/src/Commands";
import { IProtocol, IProtocolType, IChannelBody } from "chatcommon/src/IProtocol";
import { iSocket } from "chatcommon/src/iSocket";
import { ChatSvrSocket } from "./ChatSvrSocket";
import { Log } from "chatcommon/src/log/Log";

export class ChannelCommand extends SimpleCommand {
    constructor() { super() }
    receiver(protocol: IProtocol, sock: iSocket): void {
        let channelBody:IChannelBody = protocol.msg_body;
        switch (protocol.type) {
            case IProtocolType.joinChannel:
                Log.infoLog(`${protocol.id}进入了 channel : ${channelBody.channelName}`)
                break;
            case IProtocolType.levelChannel:
                Log.infoLog(`${protocol.id}离开了 channel : ${channelBody.channelName}`)
                break;
        }
    }

    send(type: number, socket: iSocket, ...args) {
        let chatClient: ChatSvrSocket = <ChatSvrSocket>socket;
        switch (type) {
            case IProtocolType.joinChannel:
            case IProtocolType.levelChannel:
                const channelName: string = args[0];
                let channelBody: IChannelBody = {
                    channelName: channelName,
                }
                var protocol: IProtocol = {
                    type: type,
                    in_char_svr: chatClient.chat_svr.svr_name,
                    in_product: chatClient.opts.product,
                    id: chatClient.opts.userId,
                    msg_body: channelBody
                }
                socket.send(protocol);
            break;
        }
    }
}