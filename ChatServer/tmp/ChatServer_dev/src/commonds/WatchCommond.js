"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IProtocol_1 = require("chatcommon/src/IProtocol");
const Product_1 = require("../chatServer/Product");
const Commands_1 = require("chatcommon/src/Commands");
class WatchCommond extends Commands_1.SimpleCommand {
    constructor() { super(); }
    receiver(protocol, socket) {
        var type = protocol.type;
        switch (type) {
            case IProtocol_1.IProtocolType.watch:
                var body = protocol.msg_body;
                var cli = socket;
                if (cli) {
                    cli.watchBody = body;
                    Product_1.product.addClient(cli);
                    let ok = { type: IProtocol_1.IProtocolType.watchOk, in_char_svr: protocol.in_char_svr, in_product: protocol.in_product, id: protocol.id, msg_body: body };
                    cli.send(ok);
                }
                break;
            default:
                break;
        }
    }
    send(type, socket, ...args) { }
}
exports.WatchCommond = WatchCommond;
//# sourceMappingURL=WatchCommond.js.map