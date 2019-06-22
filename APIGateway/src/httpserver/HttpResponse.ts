import { Context } from "koa";
import { BaseResp } from "chatcommon/src/IProtocol";

export async function sendResp(ctx:Context,next,resp:BaseResp) {
    let response = ctx.response;
    if(response) {
        response.body = resp;
    }
}