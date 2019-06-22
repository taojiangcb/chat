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
const sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const events_1 = require("events");
/**
 * 默认全局的mysql 表配置
 */
exports.defColumnOpts = {
    timestamps: false,
    freezeTableName: true
    // createdAt: "createTime",
    // updatedAt: "updateTime",
    // deletedAt: "deleteTime",
};
exports.defSyncOpts = {
    force: false,
};
class MySqlClient extends events_1.EventEmitter {
    constructor() {
        super();
        /**
         * 当前数据操作的表集合
         */
        this.tables = {};
    }
    connection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (opts && !opts.logging) {
                opts.logging = this.logHandler.bind(this);
            }
            this.dbClient = new sequelize(opts);
            return yield this.dbClient.authenticate();
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.dbClient) {
                yield this.dbClient.close();
            }
        });
    }
    /**
     * 按文件加路径加载所有表的配置
     * @param dir
     */
    loadModel(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let files = fs.readdirSync(dir);
                let jsFiles = files.filter((name, index, args) => {
                    return name.endsWith(".js");
                });
                jsFiles.forEach((f) => __awaiter(this, void 0, void 0, function* () {
                    console.log(`import model from file ${f}...`);
                    let name = f.substr(0, f.length - 3);
                    let d = require(path.join(dir, f));
                    if (d) {
                        var tableName = d.tableName;
                        var tableColumn = d.column;
                        var opts = d.opts;
                        var sync_opt = d.sync_opt;
                        try {
                            this.defineTable(tableName, tableColumn, opts);
                            yield this.dbClient.sync(sync_opt);
                            console.debug(`sync:${tableName} force:${sync_opt.force}`);
                            console.log(d);
                            resolve();
                        }
                        catch (e) {
                            console.error(`define error ${tableName} + ${e}`);
                            reject(e);
                        }
                        // this.dbClient.sync(sync_opt).then(value=>{
                        //     console.debug(`sync:${tableName} force:${sync_opt.force}`);
                        // });
                    }
                }));
            });
        });
    }
    defineTable(name, attr, opts) {
        var dataModuel = this.dbClient.define(name, attr, opts);
        this.tables[name] = dataModuel;
    }
    /**
  * mysql log 日志输出
  * @param sql
  * @param time
  */
    logHandler(sql, time) {
        console.debug(`sql:${sql} runTime:${time}`);
        let eventParam = {
            sql_text: sql.replace('Executed (default):', ''),
            const_time: time
        };
        //this.emit(SequelizeEvents.RECORD, eventParam);
    }
    /**
     * 获取一张数据表的操作对象
     * @param tableName
     */
    getTable(tableName) {
        return this.tables[tableName];
    }
    get sequelizeClient() {
        return this.dbClient;
    }
}
exports.MySqlClient = MySqlClient;
