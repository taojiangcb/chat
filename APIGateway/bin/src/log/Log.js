"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = require("log4js");
const path = require("path");
const app_1 = require("../../app");
var logPath = path.parse(__dirname).dir;
var ca = {
    type: "console"
};
var logFileAppender = {
    type: "file",
    filename: path.resolve(logPath, "./logOut.log"),
};
var infoFileAppender = {
    type: "dateFile",
    filename: path.resolve(logPath, "./logs/info/info"),
    pattern: "-yyyy-MM-dd-hh.log",
    alwaysIncludePattern: true,
    layout: {
        type: "basic"
    },
    keepFileExt: false,
    encoding: "utf-8"
};
var errorFileAppender = {
    type: "dateFile",
    filename: path.resolve(logPath, "./logs/error/err"),
    pattern: "-yyyy-MM-dd-hh.log",
    alwaysIncludePattern: true,
    layout: {
        type: "basic",
    },
    keepFileExt: false,
    encoding: "utf-8"
};
let logCfg = {
    appenders: {
        out: ca,
        file: logFileAppender,
        info: infoFileAppender,
        error: errorFileAppender,
    },
    categories: {
        default: { appenders: ['out'], level: 'trace' },
        file: { appenders: ["file"], level: "debug" },
        info: { appenders: ["info"], level: "info" },
        error: { appenders: ["error"], level: "error" },
    }
};
log4js.configure(logCfg);
let outLogger = log4js.getLogger("out");
outLogger.level = "all";
let fileLogger = log4js.getLogger("file");
fileLogger.level = "debug";
let infoLogger = log4js.getLogger("info");
infoLogger.level = "info";
let errorLogger = log4js.getLogger("error");
errorLogger.level = "error";
function debug(msg, ...args) {
    outLogger.debug(msg, args);
    let config = app_1.appGlobal.config;
    if (config && config.writeLogFile) {
        fileLogger.debug(msg, args);
    }
}
function infoLog(msg, ...args) {
    infoLogger.info(msg, args);
}
function errorLog(msg, ...args) {
    errorLogger.error(msg, args);
}
function log(msg, ...args) {
    outLogger.trace(msg);
}
exports.Log = {
    log: log,
    debug: debug,
    infoLog: infoLog,
    errorLog: errorLog,
};
//# sourceMappingURL=Log.js.map