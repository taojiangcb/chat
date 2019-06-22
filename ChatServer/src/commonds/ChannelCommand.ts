import { product } from "../chatServer/Product";
import { IProtocol, IProtocolType, IChannelBody } from "chatcommon/src/IProtocol";
import { SimpleCommand } from "chatcommon/src/Commands";
import { iSocket } from "chatcommon/src/iSocket";
import { Log } from "chatcommon/src/log/Log";

export class ChannelCommond extends SimpleCommand {
    constructor() { super() }
    receiver(protocol:IProtocol,socket:iSocket):void {
        let channelBody:IChannelBody = protocol.msg_body;
        switch(protocol.type) {
            case IProtocolType.joinChannel:         //进入房间
                Log.infoLog(`${protocol.id}进入了 channel : ${channelBody.channelName}`)
                product.watchChannel(protocol.in_product,channelBody.channelName,protocol.id);
                socket.send(protocol);
                break;                
            case IProtocolType.levelChannel:        //退出房间
                Log.infoLog(`${protocol.id}离开了 channel : ${channelBody.channelName}`)
                product.unWatchChannel(protocol.in_product,channelBody.channelName,protocol.id);
                socket.send(protocol);
                break;
        }
    }
}