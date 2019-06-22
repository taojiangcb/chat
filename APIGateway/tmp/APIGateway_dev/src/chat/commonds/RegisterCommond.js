"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChatIO_1 = require("../ChatIO");
const IProtocol_1 = require("chatcommon/src/IProtocol");
const Commands_1 = require("chatcommon/src/Commands");
const Log_1 = require("chatcommon/src/log/Log");
class RegisterCommond extends Commands_1.SimpleCommand {
    constructor() { super(); }
    receiver(protocol, socket) {
        var type = protocol.type;
        let sock = socket;
        switch (type) {
            case IProtocol_1.IProtocolType.register:
                var svr_name = protocol.in_char_svr;
                sock.svr_name = svr_name;
                sock.svr_register = protocol.msg_body;
                ChatIO_1.chatIo.addClient(sock);
                Log_1.Log.debug("注册一台服务器");
                break;
            case IProtocol_1.IProtocolType.status:
                var svr_name = protocol.in_char_svr;
                let statusBody;
                var isNew = !sock.svr_status ? true : false;
                try {
                    statusBody = protocol.msg_body;
                    sock.svr_status = statusBody;
                    if (isNew) {
                        Log_1.Log.debug("服务器第一次同步状态");
                        let register_succeed = {
                            type: IProtocol_1.IProtocolType.registerSucceed,
                            in_char_svr: svr_name,
                            to_chat_svr: svr_name,
                            in_product: protocol.in_product,
                            msg_body: "",
                            id: ""
                        };
                        socket.send(register_succeed);
                    }
                    else {
                        if (ChatIO_1.svrCache.has(protocol.in_product)) {
                            var state = ChatIO_1.svrCache[protocol.in_product];
                            if (state.collect_count == 0) {
                                ChatIO_1.svrCache.delete(protocol.in_product);
                            }
                        }
                    }
                }
                catch (e) {
                    var msg = e ? String(e.stack | e.message) : "";
                    if (msg) {
                        Log_1.Log.errorLog(msg);
                    }
                }
                break;
        }
    }
}
exports.RegisterCommond = RegisterCommond;
//# sourceMappingURL=RegisterCommond.js.map