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
const redis = require("redis");
const wrapper = require("co-redis");
const Log_1 = require("../../log/Log");
/**
 * Redis 读写助手
 */
class RedisHelp {
    constructor() {
        this.ip = "";
        this.port = 6379;
        this.redisClient = null;
    }
    /**
     * 初始化RedisClient
     * @param opts
     */
    init(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            this.redisOpts = opts;
            return new Promise((resolve, reject) => {
                this.ip = opts.host, this.port = opts.port;
                this.redisClient = redis.createClient(opts);
                this.redisco = wrapper(this.redisClient);
                this.redisClient.on("error", (message) => {
                    if (message) {
                        Log_1.Log.infoLog(message);
                        reject(message);
                    }
                });
                this.redisClient.on("ready", (err) => {
                    if (err) {
                        Log_1.Log.infoLog(err);
                        reject(err);
                    }
                    else {
                        Log_1.Log.infoLog("redis 连接成功!!");
                        resolve();
                    }
                });
                this.redisClient.on("disconnect", this.disconnectHandler);
                this.redisClient.on("reconnecting", this.reconnectHandler);
            });
        });
    }
    disconnectHandler() {
        Log_1.Log.infoLog("disconnectHandler");
    }
    reconnectHandler(err, reply) {
        Log_1.Log.infoLog('reconnecting' + err + '|' + reply);
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.del(key);
        });
    }
    setString(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.set(key, value);
        });
    }
    getString(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.get(key);
        });
    }
    /**
     * 自增1
     * @param key
     */
    incr(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.incr(key);
        });
    }
    /**
     * 自减1
     * @param key
     */
    decr(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.decr(key);
        });
    }
    /**
     * 将 key 的值设为 value ，当且仅当 key 不存在。
     * 若给定的 key 已经存在，则 SETNX 不做任何动作。
     * 设置成功：1， 设置失败：0
     */
    setnx(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.setnx(key, value);
        });
    }
    //===================================================================list==========================================
    /**
     * 从头部写入一个或多个数据到Lists
     *
     */
    lpush(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.lpush(key, value);
        });
    }
    /**
     * 从尾部写入一个或多个数据到Lists
     * @type {Function}
     */
    rpush(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.rpush(key, value);
        });
    }
    /**
     * 从lists头部拿数据,后进先出
     * @type {Function}
     */
    lpop(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.lpop(key);
        });
    }
    /**
     * 从lists头部拿数据,后进先出
     * @type {Function}
     */
    rpop(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.rpop(key);
        });
    }
    /**
     * 从lists头部拿数据,后进先出
     * @type {Function}
     */
    llen(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.llen(key);
        });
    }
    //===================================================hashtable==============================================
    /**
    * 写入hash
    * @type {Function}
    */
    hset(key, field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.hset(key, field, value);
        });
    }
    /**
     * 批量写入hash
     * @type {Function}
     * @fields {Object}
     */
    hmset(key, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.redisco.hmset(key, fields);
        });
    }
    /**
     * 获取hash值
     * @type {Function}
     */
    hget(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.hget(key, field);
        });
    }
    /**
     * 获取所有hash值
     * @type {Function}
     */
    hgetall(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.hgetall(key);
        });
    }
    /**
     * 删除hash单个域
     * @type {Function}
     */
    hdel(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.hedl(key, field);
        });
    }
    //========================================================时效性，生命周期====================================================
    /**获取以毫秒为单位的密钥生存时间 */
    pttl(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.pttl(key);
        });
    }
    /**
     * 设置过期时间
     * @param key
     * @param seconds
     */
    expire(key, seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.expire(key, seconds);
        });
    }
    /**
     * 从密钥中删除过期。
     * @param key Remove the expiration from a key.
     */
    persist(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.persist(key);
        });
    }
    /**
     * 删除以毫秒为单位的密钥生存时间。
     * @param key
     * @param milliseconds
     */
    pexpire(key, milliseconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisco.pexpire(key);
        });
    }
    get client() {
        return this.redisClient;
    }
    get clientCo() {
        return this.redisco;
    }
}
exports.RedisHelp = RedisHelp;
exports.redistInst = new RedisHelp();
