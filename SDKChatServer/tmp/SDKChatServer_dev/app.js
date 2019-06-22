"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = require("chatcommon/src/log/Log");
const fs = require("fs");
const cluster = require("cluster");
const ConverSvr_1 = require("./src/conversvr/ConverSvr");
Log_1.Log.log4jInit(__dirname, true);
exports.appGlobal = global;
var run_env = process.env.NODE_ENV || "dev";
var workers = new Map();
var readConf = () => {
    const file_url = `${__dirname}/config_${run_env}.json`;
    exports.appGlobal.config = JSON.parse(fs.readFileSync(file_url, { encoding: "utf8" }));
};
function main() {
    if (cluster.isMaster) {
        readConf();
        var svr = new ConverSvr_1.ConverSvr();
        process.on("uncaughtException", (err) => {
            Log_1.Log.debug(err.stack || err.message);
        });
        process.on("exit", () => {
            Log_1.Log.debug("master exit......");
        });
    }
    else {
    }
}
main();
//# sourceMappingURL=app.js.map