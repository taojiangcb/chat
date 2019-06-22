"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const cluster = require("cluster");
const fs = require("fs");
const ChatGatewaySvr_1 = require("./src/chat/ChatGatewaySvr");
exports.appGlobal = global;
exports.appGlobal.rootPath = __dirname;
function startMaster() {
    const conf_file = `conf_${process.env.NODE_ENV}.json`;
    const conf_url = path.join(__dirname, "src/conf/", conf_file);
    const conf_str = fs.readFileSync(conf_url, { encoding: "utf8" });
    let config = JSON.parse(conf_str);
    exports.appGlobal.config = config;
    console.log(exports.appGlobal.config);
    var chatGateway = new ChatGatewaySvr_1.ChatGatewaySvr();
}
function main() {
    if (cluster.isMaster) {
        startMaster();
    }
}
main();
//# sourceMappingURL=app.js.map