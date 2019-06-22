"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChatIO_1 = require("../../chat/ChatIO");
const HttpResponse_1 = require("../HttpResponse");
const IProtocol_1 = require("chatcommon/src/IProtocol");
const Error_1 = require("chatcommon/src/Error");
function getChatServer(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = ctx.request.body;
        const product = body.product || "";
        const auth = body.auth || "";
        var cacheSvr = ChatIO_1.svrCache[product];
        if (cacheSvr) {
            HttpResponse_1.sendResp(ctx, next, new IProtocol_1.BaseResp(true, 0, "", cacheSvr));
            return;
        }
        let data;
        let clients = ChatIO_1.chatIo.allClients();
        if (clients.length > 0) {
            clients.sort((a, b) => {
                if (a.svr_status && b.svr_status) {
                    if (a.svr_status.collect_count < b.svr_status.collect_count)
                        return -1;
                    else if (a.svr_status.collect_count > b.svr_status.collect_count)
                        return 1;
                }
                return 0;
            });
            data = clients[0].svr_register;
            ChatIO_1.svrCache[product] = data;
        }
        if (data) {
            HttpResponse_1.sendResp(ctx, next, new IProtocol_1.BaseResp(true, 0, "", data));
        }
        else {
            HttpResponse_1.sendResp(ctx, next, new IProtocol_1.BaseResp(false, Error_1.ERROR_CODE.ERROR_500, Error_1.ERROR_MSG.ERROR_500));
        }
    });
}
function gmSendMsg(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var body = ctx.request.body;
        const auth = body.auth;
        const msg = body.msg || "";
        const gameid = body.gameid;
        const platId = body.playId;
        const product = `${gameid}##${platId}`;
        const toChannel = body.toChannel || "/";
        if (msg) {
            let protocol = {
                id: "GM",
                in_product: product,
                in_char_svr: "GMSvr",
                type: IProtocol_1.IProtocolType.message,
                msg_body: msg,
            };
            ChatIO_1.chatIo.send(protocol);
        }
    });
}
module.exports = {
    'POST /chatServer/get': getChatServer,
    'POST /chatServer/gmSendMsg': gmSendMsg
};
//# sourceMappingURL=ChatServer.js.map