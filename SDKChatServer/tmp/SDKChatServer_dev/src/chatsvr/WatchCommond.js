"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Commands_1 = require("chatcommon/src/Commands");
const Log_1 = require("chatcommon/src/log/Log");
class WatchCommon extends Commands_1.SimpleCommand {
    constructor() { super(); }
    receiver(protocol, sock) {
        Log_1.Log.infoLog(`${protocol.id} 连接接入成功..`);
    }
    send(type, socket, ...args) {
        let chatClient = socket;
        let watchBody = {
            product: chatClient.opts.product,
            userId: chatClient.opts.userId,
            token: chatClient.chat_svr.token
        };
        var protocol = {
            type: type,
            in_char_svr: chatClient.chat_svr.svr_name,
            in_product: chatClient.opts.product,
            id: chatClient.opts.userId,
            msg_body: watchBody
        };
        socket.send(protocol);
    }
}
exports.WatchCommon = WatchCommon;
//# sourceMappingURL=WatchCommond.js.map