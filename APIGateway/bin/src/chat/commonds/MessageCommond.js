"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Commands_1 = require("../Commands");
const ChatIO_1 = require("../ChatIO");
const common_1 = require("common");
class MessageCommand extends Commands_1.SimpleCommand {
    constructor() { super(); }
    receiver(protocol, socket) {
        var type = protocol.type;
        switch (type) {
            case common_1.IProtocolType.message:
                ChatIO_1.chatIo.send(protocol);
                break;
        }
    }
}
exports.MessageCommand = MessageCommand;
//# sourceMappingURL=MessageCommond.js.map