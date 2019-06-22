"use strict";
/**日志文件处理 */
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = require("log4js");
const path = require("path");
class Log4JS {
    constructor() {
        // this.logPath = global["logDir"] || __dirname;
        // /**
        //  * debug 信息是否要写道日志里
        //  */
        // this.writeLogFile = global["writeLogFile"] || true;
        //配置 Console
        var ca = { type: "console" };
        //配置 logFIle
        var logFileAppender = {
            type: "file",
            filename: path.resolve(Log4JS.logPath, "./logOut.log"),
        };
        //配置info 追逐
        var infoFileAppender = {
            type: "dateFile",
            filename: path.resolve(Log4JS.logPath, "./logs/info/info"),
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
            filename: path.resolve(Log4JS.logPath, "./logs/error/err"),
            pattern: "-yyyy-MM-dd-hh.log",
            alwaysIncludePattern: true,
            layout: {
                type: "basic",
            },
            keepFileExt: false,
            encoding: "utf-8"
        };
        var logCfg = {
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
        this.outLogger = log4js.getLogger("out");
        this.outLogger.level = "all";
        this.fileLogger = log4js.getLogger("file");
        this.fileLogger.level = "debug";
        this.infoLogger = log4js.getLogger("info");
        this.infoLogger.level = "info";
        this.errorLogger = log4js.getLogger("error");
        this.errorLogger.level = "error";
    }
}
Log4JS.logPath = __dirname;
/**
 * debug 信息是否要写道日志里
 */
Log4JS.writeLogFile = true;
var log4j;
function log4jInit(logPath, writeLogFile = true) {
    Log4JS.logPath = logPath;
    Log4JS.writeLogFile = writeLogFile;
    if (!log4j) {
        log4j = new Log4JS();
    }
}
function debug(msg, ...args) {
    log4j.outLogger.debug(msg, args);
    if (Log4JS.writeLogFile) {
        log4j.fileLogger.debug(msg, args);
    }
}
function infoLog(msg, ...args) {
    log4j.outLogger.debug(msg, args);
    if (log4j) {
        log4j.infoLogger.info(msg, args);
    }
}
function errorLog(msg, ...args) {
    log4j.outLogger.debug(msg, args);
    if (log4j) {
        log4j.errorLogger.error(msg, args);
    }
}
function log(msg, ...args) {
    if (log4j) {
        log4j.outLogger.trace(msg);
    }
}
exports.Log = {
    log: log,
    debug: debug,
    infoLog: infoLog,
    errorLog: errorLog,
    log4jInit: log4jInit,
};
