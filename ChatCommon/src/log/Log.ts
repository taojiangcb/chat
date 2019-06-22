/**日志文件处理 */

import log4js = require("log4js");
import path = require("path");


class Log4JS {

    static logPath: string =  __dirname;
    /**
     * debug 信息是否要写道日志里
     */
    static writeLogFile: boolean =  true;

    outLogger: log4js.Logger;
    fileLogger: log4js.Logger;
    infoLogger: log4js.Logger;
    errorLogger: log4js.Logger;

    constructor() {

        // this.logPath = global["logDir"] || __dirname;
        // /**
        //  * debug 信息是否要写道日志里
        //  */
        // this.writeLogFile = global["writeLogFile"] || true;

        //配置 Console
        var ca: log4js.ConsoleAppender = { type: "console" }

        //配置 logFIle
        var logFileAppender: log4js.FileAppender = {
            type: "file",
            filename: path.resolve(Log4JS.logPath, "./logOut.log"),
        }

        //配置info 追逐
        var infoFileAppender: log4js.DateFileAppender = {
            type: "dateFile",
            filename: path.resolve(Log4JS.logPath, "./logs/info/info"),
            pattern: "-yyyy-MM-dd-hh.log",
            alwaysIncludePattern: true,
            layout: {
                type: "basic"
            },
            keepFileExt: false,
            encoding: "utf-8"
        }

        var errorFileAppender: log4js.DateFileAppender = {
            type: "dateFile",
            filename: path.resolve(Log4JS.logPath, "./logs/error/err"),
            pattern: "-yyyy-MM-dd-hh.log",
            alwaysIncludePattern: true,
            layout: {
                type: "basic",
            },
            keepFileExt: false,
            encoding: "utf-8"
        }

        var logCfg: log4js.Configuration = {
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
        }

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

var log4j: Log4JS;
function log4jInit(logPath: string, writeLogFile: boolean = true): void {
    Log4JS.logPath = logPath;
    Log4JS.writeLogFile = writeLogFile;
    if (!log4j) {
        log4j = new Log4JS();
    }
}

function debug(msg: string, ...args: any[]) {
    log4j.outLogger.debug(msg, args);
    if (Log4JS.writeLogFile) {
        log4j.fileLogger.debug(msg, args);
    }
}

function infoLog(msg: string, ...args: any[]) {
    log4j.outLogger.debug(msg, args);
    if (log4j) {
        log4j.infoLogger.info(msg, args);
    }
}

function errorLog(msg: string, ...args: any[]) {
    log4j.outLogger.debug(msg, args);
    if (log4j) {
        log4j.errorLogger.error(msg, args);
    }
}

function log(msg: string, ...args: any[]) {
    if (log4j) {
        log4j.outLogger.trace(msg);
    }
}

export var Log = {
    log: log,
    debug: debug,
    infoLog: infoLog,
    errorLog: errorLog,
    log4jInit: log4jInit,
};