"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Commands_1 = require("chatcommon/src/Commands");
const IProtocol_1 = require("chatcommon/src/IProtocol");
const Log_1 = require("chatcommon/src/log/Log");
class ChannelCommand extends Commands_1.SimpleCommand {
    constructor() { super(); }
    receiver(protocol, sock) {
        let channelBody = protocol.msg_body;
        switch (protocol.type) {
            case IProtocol_1.IProtocolType.joinChannel:
                Log_1.Log.infoLog(`${protocol.id}进入了 channel : ${channelBody.channelName}`);
                break;
            case IProtocol_1.IProtocolType.levelChannel:
                Log_1.Log.infoLog(`${protocol.id}离开了 channel : ${channelBody.channelName}`);
                break;
        }
    }
    send(type, socket, ...args) {
        let chatClient = socket;
        switch (type) {
            case IProtocol_1.IProtocolType.joinChannel:
            case IProtocol_1.IProtocolType.levelChannel:
                const channelName = args[0];
                let channelBody = {
                    channelName: channelName,
                };
                var protocol = {
                    type: type,
                    in_char_svr: chatClient.chat_svr.svr_name,
                    in_product: chatClient.opts.product,
                    id: chatClient.opts.userId,
                    msg_body: channelBody
                };
                socket.send(protocol);
                break;
        }
    }
}
exports.ChannelCommand = ChannelCommand;
//# sourceMappingURL=ChannelCommand.js.map