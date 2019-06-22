import redis = require("redis");
import wrapper = require("co-redis");
import { Log } from "../../log/Log";

/**
 * Redis 读写助手
 */
export class RedisHelp {
    ip: string = "";
    port: number = 6379;

    private redisClient: redis.RedisClient = null;
    private redisco;

    /**redis 缓存配置 */
    private redisOpts:redis.ClientOpts;
    
    constructor() { }

    /**
     * 初始化RedisClient
     * @param opts 
     */
    async init(opts: redis.ClientOpts) {

        this.redisOpts = opts;

        return new Promise((resolve, reject) => {
            this.ip = opts.host, this.port = opts.port;

            this.redisClient = redis.createClient(opts);
            this.redisco = wrapper(this.redisClient);

            this.redisClient.on("error", (message) => {
                if (message) {
                    Log.infoLog(message);
                    reject(message);
                }
            });
            this.redisClient.on("ready", (err) => {
                if (err) {
                    Log.infoLog(err);
                    reject(err);
                } else {
                    Log.infoLog("redis 连接成功!!")
                    resolve();
                }
            });
            this.redisClient.on("disconnect", this.disconnectHandler);
            this.redisClient.on("reconnecting", this.reconnectHandler);
        });
    }

    disconnectHandler() {
        Log.infoLog("disconnectHandler");
    }

    reconnectHandler(err, reply) {
        Log.infoLog('reconnecting' + err + '|' + reply);
    }

    async del(key: string) {
        return await this.redisco.del(key);
    }

  
    async setString(key: string, value: string) {
        return await this.redisco.set(key, value);
    }

    async getString(key: string) {
        return await this.redisco.get(key);
    }

    /**
     * 自增1
     * @param key 
     */
    async incr(key: string) {
        return await this.redisco.incr(key);
    }

    /**
     * 自减1
     * @param key 
     */
    async decr(key: string) {
        return await this.redisco.decr(key);
    }


    /**
     * 将 key 的值设为 value ，当且仅当 key 不存在。
     * 若给定的 key 已经存在，则 SETNX 不做任何动作。
     * 设置成功：1， 设置失败：0
     */
    async setnx(key: string, value: string) {
        return await this.redisco.setnx(key, value);
    }

    //===================================================================list==========================================
    
    /**
     * 从头部写入一个或多个数据到Lists
     * 
     */
    async lpush(key: string, value: string) {
        return await this.redisco.lpush(key, value);
    }

    /**
     * 从尾部写入一个或多个数据到Lists
     * @type {Function}
     */
    async rpush(key: string, value: string) {
        return await this.redisco.rpush(key, value);
    }

    /**
     * 从lists头部拿数据,后进先出
     * @type {Function}
     */
    async lpop(key: string) {
        return await this.redisco.lpop(key);
    }

    /**
     * 从lists头部拿数据,后进先出
     * @type {Function}
     */
    async rpop(key: string) {
        return await this.redisco.rpop(key);
    }

    /**
     * 从lists头部拿数据,后进先出
     * @type {Function}
     */
    async llen(key: string) {
        return await this.redisco.llen(key);
    }

    //===================================================hashtable==============================================

    /**
    * 写入hash
    * @type {Function}
    */
    async hset(key: string, field: string, value: string) {
        return await this.redisco.hset(key, field, value);
    }

    /**
     * 批量写入hash
     * @type {Function}
     * @fields {Object}
     */
    async hmset(key: string, fields: any) {
        return this.redisco.hmset(key, fields);
    }

    /**
     * 获取hash值
     * @type {Function}
     */
    async hget(key: string, field: string) {
        return await this.redisco.hget(key, field);
    }

    /**
     * 获取所有hash值
     * @type {Function}
     */
    async hgetall(key: string) {
        return await this.redisco.hgetall(key);
    }

    /**
     * 删除hash单个域
     * @type {Function}
     */
    async hdel(key: string, field: string) {
        return await this.redisco.hedl(key, field);
    }

    //========================================================时效性，生命周期====================================================

    /**获取以毫秒为单位的密钥生存时间 */
    async pttl(key:string) {
        return await this.redisco.pttl(key);
    }
    
    /**
     * 设置过期时间
     * @param key 
     * @param seconds 
     */
    async expire(key: string, seconds: number) {
        return await this.redisco.expire(key, seconds);
    }

    /**
     * 从密钥中删除过期。
     * @param key Remove the expiration from a key.
     */
    async persist(key:string) {
        return await this.redisco.persist(key);
    }

    /**
     * 删除以毫秒为单位的密钥生存时间。
     * @param key 
     * @param milliseconds 
     */
    async pexpire(key:string,milliseconds:number) {
        return await this.redisco.pexpire(key);
    }

    get client() {
        return this.redisClient;
    }

    get clientCo() {
        return this.redisco;
    }
}

export var redistInst = new RedisHelp();
