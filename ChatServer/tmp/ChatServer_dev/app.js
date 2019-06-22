"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const GatewayClient_1 = require("./src/gateway/GatewayClient");
const cluster = require("cluster");
const Log_1 = require("chatcommon/src/log/Log");
const ChatServer_1 = require("./src/chatServer/ChatServer");
exports.appGlobal = global;
Log_1.Log.log4jInit(__dirname, true);
function initConfig() {
    var run_env = process.env.NODE_ENV || "dev";
    var config_file_url = path.join(__dirname, `config_${run_env}.json`);
    Log_1.Log.debug(config_file_url);
    let config = JSON.parse(fs.readFileSync(config_file_url, { encoding: "utf8" }));
    exports.appGlobal.config = config;
    exports.appGlobal.defaultPort = 8090;
}
function startGateway() {
    GatewayClient_1.gatewayClient.connect();
}
var chatSvr;
function startChatSvr() {
    chatSvr = new ChatServer_1.ChatServer();
}
var main = function () {
    if (cluster.isMaster) {
        initConfig();
        startGateway();
        startChatSvr();
    }
};
main();
//# sourceMappingURL=app.js.map