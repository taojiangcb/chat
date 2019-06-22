import {ChatClient} from "../src/chatServer/ChatClient";
import {product} from "../src/chatServer/Product";

import WebSocket = require("ws");
import { Log } from "chatcommon/src/log/Log";
import { ChannelCommond } from "../src/commonds/ChannelCommand";
import { IProtocol, IProtocolType, IWatchBody } from "chatcommon/src/IProtocol";
import { WatchCommond } from "../src/commonds/WatchCommond";
import { MessageCommand } from "../src/commonds/MessageCommand";



Log.log4jInit(__dirname,true);
var chatClient:ChatClient = new ChatClient(new WebSocket("ws://127.0.0.1"));
var watchBody:IWatchBody = {
    userId:"12306",
    token:"12306",
    product:"10000_2101",
}

var testData:IProtocol = {
    type:IProtocolType.message,
    msg_body:"Hello world",
    in_char_svr:"test",
    in_product:"test",
    id:watchBody.userId,
}

describe("测试chatServer",()=>{
    it("添加一个新的客户端",()=>{       
        var watchCmd:WatchCommond = new WatchCommond();
        var data:IProtocol = {
            type:IProtocolType.watch,
            msg_body:watchBody,
            in_char_svr:"test",
            in_product:"test",
            id:watchBody.userId,
        }
        watchCmd.receiver(data,chatClient);
    })

    it("进入一个channel",()=>{
        var channelCmd:ChannelCommond = new ChannelCommond();
        var protocol:IProtocol = {
            type:IProtocolType.joinChannel,
            msg_body:{channelName:"世界频道"},
            in_char_svr:"test",
            in_product:"test",
            id:testData.id
        }
        channelCmd.receiver(protocol,chatClient);
    })

    it("收到聊天消息",()=>{
        var bfData:string = JSON.stringify(testData);
        chatClient.onMessage(bfData);
    })

    it("测试网关转发",()=>{
        testData.to_chat_svr = "test1";
        var bfData:string = JSON.stringify(testData);
        chatClient.onMessage(bfData);
    })

    it("测试网关转发所有服务",()=>{
        testData.to_chat_svr = "*";
        var bfData:string = JSON.stringify(testData);
        chatClient.onMessage(bfData);
    })

    it("测试频道转发",()=>{
        testData.to_chat_svr = "";
        testData.to_channel = "世界频道"
        var bfData:string = JSON.stringify(testData);
        chatClient.onMessage(bfData);
    })

    it("测试私聊转发",()=>{
        testData.to_chat_svr = "";
        testData.to_channel = "世界频道";
        testData.toid = "12306"
        var bfData:string = JSON.stringify(testData);
        chatClient.onMessage(bfData);
    })

    it("退出一个channel",()=>{
        var channelCmd:ChannelCommond = new ChannelCommond();
        var protocol:IProtocol = {
            type:IProtocolType.levelChannel,
            msg_body:{channelName:"世界频道"},
            in_char_svr:"test",
            in_product:"test",
            id:testData.id
        }
        channelCmd.receiver(protocol,chatClient);
    })

    it("删除一个客户端",()=>{
        product.removeClient("12306","10000_2101");
    })
})
