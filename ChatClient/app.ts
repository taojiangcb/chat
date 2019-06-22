import http = require("http");
import WebSocket = require("ws");
import path = require("path");
import fs = require("fs");
import { Log } from "chatcommon/src/log/Log";
import { ChatSvrSocket, ConnectOpts } from "./src/ChatSvrSocket";
import { TestChatSvrSocket } from "./src/TestChatSvrSocket";


// const conf_url:string = __dirname;
// const env_str = process.env.NODE_ENV;
// const conf_str:string = String(fs.readFileSync(`${conf_url}/src/conf/config_${env_str}.json`));
// let conf:IConfig = JSON.parse(conf_str);
// const gateway_host_get:string = `${conf.gateway_url}`;
// "gateway_url":"http://127.27.8.15:8090/chatServer/get",
//     "product":"test",
//     "auth":"12306"

var chatClient:TestChatSvrSocket;

Log.log4jInit(__dirname,true);

var main = async function() {
    var opts:ConnectOpts ={
        gateway_url:"http://172.27.8.15:8090/chatServer/get",
        product:"4110##10000",
        auth:"12306",
        userId:"12306",
    }
    var a = new TestChatSvrSocket(opts);
    // var b = new TestChatSvrSocket(opts);
    // var c = new TestChatSvrSocket(opts);
    // var d = new TestChatSvrSocket(opts);
    // var e = new TestChatSvrSocket(opts);
 }();