
import {chatIo} from "../src/chat/ChatIO";
import {RegisterCommond} from "../src/chat/commonds/RegisterCommond";
import { IProtocol, IProtocolType, IRegisterBody, IStatusBody } from "../../ChatCommon/src/IProtocol";
import { Log } from "chatcommon/src/log/Log";
import { ChatSocket } from "../src/chat/ChatSocket";
import { iSocket } from "chatcommon/src/iSocket";
import WebSocket = require("ws");
import app = require("../app")

Log.log4jInit(__dirname,true);

describe("hello chatio",function(){
    before(()=>{
        app.appGlobal
    });
    this.timeout(100000);

    it("注册一台服务区",()=>{
        var registerBody:IRegisterBody = {
            ip:"127.0.0.1",
            port:3034,
            svr_name:"test_test",
            token:"12306"
        }
        var iProtocol:IProtocol = {type:IProtocolType.register,msg_body:registerBody,in_char_svr:"test",to_chat_svr:"*",in_product:"test",id:""}
        var register:RegisterCommond = new RegisterCommond();
        var sock:ChatSocket = new ChatSocket(new WebSocket("http://127.0.0.1"));
        register.receiver(iProtocol,sock);
    })

    it("同步服务器的状态",()=>{
        var status:IStatusBody = {
            channels:["/"],
            products:["10000_2101"],
            collect_count:100,
            svr_name:"test"
        }
        var iProtocol:IProtocol = {type:IProtocolType.status,msg_body:status,in_char_svr:"test",to_chat_svr:"*",in_product:"test",id:""}
        var register:RegisterCommond = new RegisterCommond();
        var sock:ChatSocket = new ChatSocket(new WebSocket("http://127.0.0.1"));
        register.receiver(iProtocol,sock);
    })

    it("发送到同一台服务器上",()=>{
        var iProtocol:IProtocol = {type:IProtocolType.message,msg_body:"你好",in_char_svr:"test",in_product:"test",id:""}
        chatIo.send(iProtocol);
    })

    it("发送到其他服务器",()=>{
        var iProtocol:IProtocol = {type:IProtocolType.message,msg_body:"转发到服务器",in_char_svr:"test",to_chat_svr:"test111",in_product:"test",id:""}
        chatIo.send(iProtocol);
    })

    it("发送到所有服务区器上",()=>{
        var iProtocol:IProtocol = {type:IProtocolType.message,msg_body:"发送到所有服务区器上",in_char_svr:"test",to_chat_svr:"*",in_product:"test",id:""}
        chatIo.send(iProtocol);
    })
})