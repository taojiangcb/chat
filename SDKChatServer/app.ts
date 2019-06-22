import { Log } from "chatcommon/src/log/Log";
import { AppGlobal } from "./AppGlobal";
import { IConfig } from "./src/conf/IConfig";
import fs = require("fs");
import os = require("os");
import cluster = require("cluster");
import { ConverSvr } from "./src/conversvr/ConverSvr";
import WebSocket = require("ws");
import { IWatchBody, IProtocol, IProtocolType } from "chatcommon/src/IProtocol";
import { RedisHelp } from "chatcommon/src/database/redisBase/RedisHelp";
import redis = require("redis");
import { platRedis } from "./src/PlatRedis";
import { ChildProcess, fork } from "child_process";

/** * 日志 */
Log.log4jInit(__dirname, true);
export var appGlobal: AppGlobal = global;
var run_env: string = process.env.NODE_ENV || "dev";
var workers: Map<string, cluster.Worker> = new Map();

var readConf = () => {
    const file_url: string = `${__dirname}/config_${run_env}.json`;
    appGlobal.config = JSON.parse(fs.readFileSync(file_url, { encoding: "utf8" }));
}

async function main() {

    if (cluster.isMaster) {
        readConf();
        let config = appGlobal.config;
        let redisOpts:redis.ClientOpts = {
            host:config.redis.ip,
            port:config.redis.port,
            auth_pass:config.redis.flag.auth_pass,
            db:config.redis.select
        }

        let redisHelp:RedisHelp = new RedisHelp();
        await redisHelp.init(redisOpts);
        platRedis.redisCli = redisHelp;

        process.on("uncaughtException", (err) => {
            Log.debug(err.stack || err.message);
        })

        process.on("exit", () => {
            Log.debug("master exit......");
            cluster.setupMaster({})
        })

        // for(var i = 0; i < os.cpus().length; i++) {
        //     var worker = cluster.fork();
        //     workers[worker.id] = worker;
        //     console.log(`create worker ${worker.id}`);
        // }

        // cluster.on("exit",(worker,code,sigint:string)=>{
        //     console.log(`worker exit by ${worker.id} code is ${code} sigint is ${sigint}`);
        // })

        var svr: ConverSvr = new ConverSvr();
    }
    else {
        console.log(`this process id ${process.pid}`);
    }
}

main();