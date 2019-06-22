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
const path = require("path");
const cluster = require("cluster");
const fs = require("fs");
const ChatGatewaySvr_1 = require("./src/chat/ChatGatewaySvr");
const http = require("http");
const Koa = require("koa");
const xmlParser = require("koa-xml-body");
const bodyParser = require("koa-bodyparser");
const cors = require("koa2-cors");
const Router = require("koa-router");
const Log_1 = require("chatcommon/src/log/Log");
const RedisHelp_1 = require("chatcommon/src/database/redisBase/RedisHelp");
const DBHelp_1 = require("./src/help/DBHelp");
Log_1.Log.log4jInit(__dirname, true);
exports.appGlobal = global;
exports.appGlobal.rootPath = __dirname;
var chatGateway;
var koa;
var httpserver;
var router = new Router();
function initHttpServers(svrPath) {
    return __awaiter(this, void 0, void 0, function* () {
        var server_files;
        var files = fs.readdirSync(`${__dirname}${svrPath}`);
        server_files = files.filter((f) => {
            return f.endsWith(".js");
        });
        server_files.forEach(f => {
            let mapping = require(`${__dirname}${svrPath}/${f}`);
            for (var url in mapping) {
                if (url.startsWith("GET")) {
                    let funs = url.split(/\s+/i);
                    router.get(funs[1], mapping[url]);
                    console.log(funs);
                }
                else if (url.startsWith("POST")) {
                    let funs = url.split(/\s+/i);
                    router.post(funs[1], mapping[url]);
                    console.log(funs);
                }
                else {
                    console.log("未知服务:" + url);
                }
            }
        });
    });
}
function initKoa() {
    return __awaiter(this, void 0, void 0, function* () {
        koa = new Koa();
        koa.use(bodyParser());
        koa.use(xmlParser({
            encoding: 'utf8',
            xmlOptions: {
                explicitArray: false
            },
            onerror: (err, ctx) => {
                ctx.throw(err.status, err.message);
            }
        }));
        initHttpServers("/src/httpserver/servers");
        koa.use(router.routes());
        koa.use(bodyParser({ enableTypes: ["json", "form", "xml"] }));
        koa.use(cors());
        httpserver = http.createServer(koa.callback());
        if (exports.appGlobal.config) {
            httpserver.listen(exports.appGlobal.config.http_port || 80);
        }
    });
}
function startMaster() {
    return __awaiter(this, void 0, void 0, function* () {
        const env = process.env.NODE_ENV || "dev";
        const conf_file = `config_${env}.json`;
        const conf_url = path.join(__dirname, conf_file);
        const conf_str = fs.readFileSync(conf_url, { encoding: "utf8" });
        let config = JSON.parse(conf_str);
        exports.appGlobal.config = config;
        console.log(exports.appGlobal.config);
        chatGateway = new ChatGatewaySvr_1.ChatGatewaySvr();
        initKoa();
        var redisOpt = {
            host: config.redis.ip,
            port: config.redis.port,
            auth_pass: config.redis.flag.auth_pass,
            db: config.redis.select
        };
        let redisHelp = new RedisHelp_1.RedisHelp();
        yield redisHelp.init(redisOpt);
        DBHelp_1.platRedis.redis_client = redisHelp;
        process.on("uncaughtException", (err) => {
            Log_1.Log.errorLog(err.stack || err.message);
        });
        process.on("exit", (code) => {
            Log_1.Log.infoLog(`APIGateway on exit`);
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (cluster.isMaster) {
            startMaster();
        }
    });
}
main();
//# sourceMappingURL=app.js.map