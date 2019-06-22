"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IProtocol_1 = require("chatcommon/src/IProtocol");
const GatewayClient_1 = require("../gateway/GatewayClient");
const Product_1 = require("../chatServer/Product");
const app_1 = require("../../app");
const Commands_1 = require("chatcommon/src/Commands");
const Log_1 = require("chatcommon/src/log/Log");
const GetIP_1 = require("chatcommon/src/os/GetIP");
class RegisterCommond extends Commands_1.SimpleCommand {
    constructor() { super(); }
    receiver(protocol, socket) {
        var type = protocol.type;
        switch (type) {
            case IProtocol_1.IProtocolType.registerSucceed:
                GatewayClient_1.gatewayClient.onRegisterSucceed();
                Log_1.Log.debug("gateway connect succeed");
                Log_1.Log.infoLog("--------------------- gateway connect succeed");
                break;
        }
    }
    send(type, socket, ...args) {
        let config = app_1.appGlobal.config;
        switch (type) {
            case IProtocol_1.IProtocolType.register:
                if (socket) {
                    if (config) {
                        const host = config.chat_host ? config.chat_host : `ws://${GetIP_1.localIP()}`;
                        const port = config.chat_port ? config.chat_port : Number(app_1.appGlobal.defaultPort || 8090);
                        let registerBody = {
                            ip: host,
                            port: port,
                            svr_name: config.svr_name
                        };
                        let registerProtocol = {
                            type: IProtocol_1.IProtocolType.register,
                            in_char_svr: config.svr_name,
                            msg_body: registerBody,
                            in_product: "",
                            id: "",
                        };
                        socket.send(registerProtocol);
                        Commands_1.commands.send(IProtocol_1.IProtocolType.status, socket);
                    }
                }
                break;
            case IProtocol_1.IProtocolType.status:
                if (socket) {
                    if (config) {
                        var statusBody = Product_1.product.getStatus();
                        let statusProtocol = {
                            type: IProtocol_1.IProtocolType.status,
                            msg_body: statusBody,
                            in_char_svr: config.svr_name,
                            in_product: "",
                            id: "",
                        };
                        socket.send(statusProtocol);
                    }
                }
                break;
        }
    }
}
exports.RegisterCommond = RegisterCommond;
//# sourceMappingURL=RegisterCommond.js.map