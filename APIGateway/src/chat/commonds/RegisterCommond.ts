import WebSocket = require("ws");
import { ChatSocket } from "../ChatSocket";
import { chatIo, svrCache } from "../ChatIO";
import { IProtocol, IProtocolType, IRegisterBody, IStatusBody } from "chatcommon/src/IProtocol";
import { SimpleCommand } from "chatcommon/src/Commands";
import { iSocket } from "chatcommon/src/iSocket";
import { Log } from "chatcommon/src/log/Log";

export class RegisterCommond extends SimpleCommand {
    constructor() { super() }
    receiver(protocol: IProtocol, socket: iSocket): void {
        var type: number = protocol.type;
        let sock: ChatSocket = <ChatSocket>socket;
        switch (type) {
            case IProtocolType.register:
                var svr_name: string = protocol.in_char_svr;
                sock.svr_name = svr_name;
                sock.svr_register = <IRegisterBody>protocol.msg_body;
                chatIo.addClient(sock);
                Log.debug("注册一台服务器");
                break;
            case IProtocolType.status:
                var svr_name: string = protocol.in_char_svr;
                let statusBody: IStatusBody;
                var isNew: boolean = !sock.svr_status ? true : false;  //是不是新添加的服务器
                try {
                    statusBody = protocol.msg_body
                    sock.svr_status = statusBody;
                    if (isNew) {
                        Log.debug("服务器第一次同步状态")
                        let register_succeed: IProtocol = {
                            type: IProtocolType.registerSucceed,
                            in_char_svr: svr_name,
                            to_chat_svr: svr_name,
                            in_product: protocol.in_product,
                            msg_body: "",
                            id: ""
                        };
                        socket.send(register_succeed);
                    }
                    else {
                        if(svrCache.has(protocol.in_product)) {
                            var state:IStatusBody = svrCache[protocol.in_product];
                            if(state.collect_count == 0) {
                                svrCache.delete(protocol.in_product);
                            }
                        }
                    }
                }
                catch (e) {
                    var msg: string = e ? String(e.stack | e.message) : "";
                    if (msg) {
                        Log.errorLog(msg);
                    }
                }
                break;
        }
    }
}