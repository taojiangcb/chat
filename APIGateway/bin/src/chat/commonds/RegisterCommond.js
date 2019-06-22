"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Commands_1 = require("../Commands");
const ChatIO_1 = require("../ChatIO");
const Log_1 = require("../../log/Log");
const common_1 = require("common");
class RegisterCommond extends Commands_1.SimpleCommand {
    constructor() { super(); }
    receiver(protocol, socket) {
        var type = protocol.type;
        switch (type) {
            case common_1.IProtocolType.register:
                var svr_name = protocol.in_char_svr;
                socket.svr_name = svr_name;
                socket.svr_register = protocol.msg_body;
                ChatIO_1.chatIo.addClient(socket);
                break;
            case common_1.IProtocolType.status:
                var svr_name = protocol.in_char_svr;
                let statusBody;
                var isNew = !socket.svr_status ? true : false;
                try {
                    statusBody = protocol.msg_body;
                    socket.svr_status = statusBody;
                    if (isNew) {
                        let register_succeed = { type: common_1.IProtocolType.registerSucceed, in_char_svr: svr_name, to_chat_svr: svr_name, msg_body: "" };
                        socket.send(register_succeed);
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