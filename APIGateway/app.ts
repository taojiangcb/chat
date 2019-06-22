import path = require("path");
import cluster = require("cluster");
import fs = require("fs");
import net = require("net");
import { IConfig } from "./src/conf/IConfig";
import { AppGlobal } from "./src/AppGlobal";
import { ChatGatewaySvr } from "./src/chat/ChatGatewaySvr";
import http = require("http");
import Koa = require("koa");
import xmlParser=require("koa-xml-body");
import bodyParser=require("koa-bodyparser");
import cors = require('koa2-cors'); // 跨域设置
import Router = require('koa-router');
import { Log } from "chatcommon/src/log/Log";
import { RedisHelp } from "chatcommon/src/database/redisBase/RedisHelp";
import redis = require("redis");
import { platRedis } from "./src/help/DBHelp";


Log.log4jInit(__dirname,true);

export var appGlobal:AppGlobal = global;
appGlobal.rootPath = __dirname;

/**聊天网关服务 */
var chatGateway:ChatGatewaySvr;
var koa:Koa;
var httpserver:net.Server;
var router = new Router();

/**初始化Http服务接口 */
async function initHttpServers(svrPath:string) {
    var server_files: string[];
    var files = fs.readdirSync(`${__dirname}${svrPath}`);
    server_files = files.filter((f) => {
        return f.endsWith(".js");
    });

    server_files.forEach(f => {
        let mapping = require(`${__dirname}${svrPath}/${f}`);
        for (var url in mapping) {
            if (url.startsWith("GET")) {
                let funs: string[] = url.split(/\s+/i);
                router.get(funs[1], mapping[url]);
                console.log(funs);
            } 
            else if (url.startsWith("POST")) {
                let funs: string[] = url.split(/\s+/i);
                router.post(funs[1], mapping[url]);
                console.log(funs);
            } 
            else {
                console.log("未知服务:" + url);
            }
        }
    });
}

async function initKoa() {
    koa = new Koa();
    koa.use(bodyParser());
    koa.use(xmlParser({
        encoding: 'utf8', // lib will detect it from `content-type`
        xmlOptions: {
            explicitArray: false
        },
        onerror: (err:any, ctx) => {
            ctx.throw(err.status, err.message);
        }
    }));

    initHttpServers("/src/httpserver/servers");
    koa.use(router.routes());
    koa.use(bodyParser({enableTypes:["json","form","xml"]}));
    koa.use(cors());

    httpserver = http.createServer(koa.callback());
    if(appGlobal.config) {
        httpserver.listen(appGlobal.config.http_port || 80);
    }
}

async function startMaster() {
    const env:string = process.env.NODE_ENV || "dev";
    const conf_file:string = `config_${env}.json`;
    const conf_url:string = path.join(__dirname,conf_file);
    const conf_str:string = fs.readFileSync(conf_url,{encoding:"utf8"});
    let config:IConfig = JSON.parse(conf_str);

    appGlobal.config = config;
    console.log(appGlobal.config);

    chatGateway = new ChatGatewaySvr();
    initKoa();
    
     /**Redis  */
     var redisOpt:redis.ClientOpts = {
        host:config.redis.ip,
        port:config.redis.port,
        auth_pass:config.redis.flag.auth_pass,
        db:config.redis.select
    }
    
    let redisHelp:RedisHelp = new RedisHelp();
    await redisHelp.init(redisOpt);
    platRedis.redis_client = redisHelp;

    process.on("uncaughtException",(err)=>{
        Log.errorLog(err.stack || err.message)
    })

    process.on("exit",(code)=>{
        Log.infoLog(`APIGateway on exit`)
    })
}

async function main() {
    if(cluster.isMaster) {
        startMaster();
    }
}

main();