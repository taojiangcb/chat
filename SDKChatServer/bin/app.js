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
const Log_1 = require("chatcommon/src/log/Log");
const fs = require("fs");
const cluster = require("cluster");
const ConverSvr_1 = require("./src/conversvr/ConverSvr");
const RedisHelp_1 = require("chatcommon/src/database/redisBase/RedisHelp");
const PlatRedis_1 = require("./src/PlatRedis");
Log_1.Log.log4jInit(__dirname, true);
exports.appGlobal = global;
var run_env = process.env.NODE_ENV || "dev";
var workers = new Map();
var readConf = () => {
    const file_url = `${__dirname}/config_${run_env}.json`;
    exports.appGlobal.config = JSON.parse(fs.readFileSync(file_url, { encoding: "utf8" }));
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (cluster.isMaster) {
            readConf();
            let config = exports.appGlobal.config;
            let redisOpts = {
                host: config.redis.ip,
                port: config.redis.port,
                auth_pass: config.redis.flag.auth_pass,
                db: config.redis.select
            };
            let redisHelp = new RedisHelp_1.RedisHelp();
            yield redisHelp.init(redisOpts);
            PlatRedis_1.platRedis.redisCli = redisHelp;
            process.on("uncaughtException", (err) => {
                Log_1.Log.debug(err.stack || err.message);
            });
            process.on("exit", () => {
                Log_1.Log.debug("master exit......");
                cluster.setupMaster({});
            });
            var svr = new ConverSvr_1.ConverSvr();
        }
        else {
            console.log(`this process id ${process.pid}`);
        }
    });
}
main();
