"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = require("../chatServer/Product");
const IProtocol_1 = require("chatcommon/src/IProtocol");
const Commands_1 = require("chatcommon/src/Commands");
const Log_1 = require("chatcommon/src/log/Log");
class ChannelCommond extends Commands_1.SimpleCommand {
    constructor() { super(); }
    receiver(protocol, socket) {
        let channelBody = protocol.msg_body;
        switch (protocol.type) {
            case IProtocol_1.IProtocolType.joinChannel:
                Log_1.Log.infoLog(`${protocol.id}进入了 channel : ${channelBody.channelName}`);
                Product_1.product.watchChannel(protocol.in_product, channelBody.channelName, protocol.id);
                socket.send(protocol);
                break;
            case IProtocol_1.IProtocolType.levelChannel:
                Log_1.Log.infoLog(`${protocol.id}离开了 channel : ${channelBody.channelName}`);
                Product_1.product.unWatchChannel(protocol.in_product, channelBody.channelName, protocol.id);
                socket.send(protocol);
                break;
        }
    }
}
exports.ChannelCommond = ChannelCommond;
//# sourceMappingURL=ChannelCommand.js.map