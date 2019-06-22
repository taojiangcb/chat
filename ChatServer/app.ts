import path = require("path")
import { IConfig } from "./src/conf/IConfig";
import fs = require("fs")
import { AppGlobal } from "./src/AppGlobal";
import { GatewayClient, gatewayClient } from "./src/gateway/GatewayClient";
import cluster = require("cluster");
import { Log,  } from "chatcommon/src/log/Log";
import { ChatServer } from "./src/chatServer/ChatServer";

export var appGlobal:AppGlobal = global;

Log.log4jInit(__dirname,true);

function initConfig():void {
    var run_env:string  = process.env.NODE_ENV || "dev";
    var config_file_url:string = path.join(__dirname,`config_${run_env}.json`);
    Log.debug(config_file_url);
    let config:IConfig = JSON.parse(fs.readFileSync(config_file_url,{encoding:"utf8"}));
    appGlobal.config = config;
    appGlobal.defaultPort = 8090;
}

function startGateway():void {
    gatewayClient.connect();
}

var chatSvr:ChatServer 
function startChatSvr():void {
    chatSvr = new ChatServer();
}

var main = function(){
    if(cluster.isMaster) {
        initConfig();
        startGateway();
        startChatSvr();
    } 
}
main();