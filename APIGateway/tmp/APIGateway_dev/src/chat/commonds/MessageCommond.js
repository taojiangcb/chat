"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChatIO_1 = require("../ChatIO");
const IProtocol_1 = require("chatcommon/src/IProtocol");
const Commands_1 = require("chatcommon/src/Commands");
class MessageCommand extends Commands_1.SimpleCommand {
    constructor() { super(); }
    receiver(protocol, socket) {
        var type = protocol.type;
        switch (type) {
            case IProtocol_1.IProtocolType.message:
                ChatIO_1.chatIo.send(protocol);
                break;
        }
    }
}
exports.MessageCommand = MessageCommand;
//# sourceMappingURL=MessageCommond.js.map