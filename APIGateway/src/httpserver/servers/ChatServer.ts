import { chatIo, svrCache } from "../../chat/ChatIO";
import { sendResp } from "../HttpResponse";
import { BaseResp, IRegisterBody, IProtocol, IProtocolType } from "chatcommon/src/IProtocol";
import { ERROR_CODE, ERROR_MSG } from "chatcommon/src/Error";
import { Context } from "koa";


/**
 * 
 * @param ctx 
 * @param next 
 */
async function getChatServer(ctx,next) {

    const body = ctx.request.body;
    const product:string = body.product || "";          //产品名字
    const auth:string = body.auth || "";                //授权

    var cacheSvr:IRegisterBody = svrCache[product];
    if(cacheSvr) {
        sendResp(ctx,next,new BaseResp(true,0,"",cacheSvr));
        return;
    }

    let data;
    let clients = chatIo.allClients();
    if(clients.length > 0) {
        clients.sort((a,b)=>{
            if(a.svr_status && b.svr_status) {
                if(a.svr_status.collect_count < b.svr_status.collect_count) return -1;
                else if(a.svr_status.collect_count > b.svr_status.collect_count) return 1;
            }
            return 0;
        })
        data = clients[0].svr_register;
        svrCache[product] = data;
    }
    if(data) {
        sendResp(ctx,next,new BaseResp(true,0,"",data));
    }
    else {
        sendResp(ctx,next,new BaseResp(false,ERROR_CODE.ERROR_500,ERROR_MSG.ERROR_500));
    }
}

async function gmSendMsg(ctx:Context,next) {
    var body:any = ctx.request.body;
    const auth:string = body.auth;
    const msg:string = body.msg || "";
    const gameid:string = body.gameid;
    const platId:string = body.playId;
    const product:string = `${gameid}##${platId}`;
    const toChannel:string = body.toChannel || "/";
    if(msg) {
        let protocol:IProtocol = {
            id:"GM",
            in_product:product,
            in_char_svr:"GMSvr",
            type:IProtocolType.message,
            msg_body:msg,
        }
        chatIo.send(protocol);
    }
}

module.exports = {
    'POST /chatServer/get':getChatServer,
    'POST /chatServer/gmSendMsg':gmSendMsg
}