import sequelize = require("sequelize");
import fs = require("fs");
import path = require("path");
import { EventEmitter } from "events";


/**
 * 默认全局的mysql 表配置
 */
export var defColumnOpts:sequelize.DefineOptions<any> = {
    timestamps:false,
    freezeTableName:true
    // createdAt: "createTime",
    // updatedAt: "updateTime",
    // deletedAt: "deleteTime",
}

export var defSyncOpts:sequelize.SyncOptions = {
    force:false,
}

export class MySqlClient extends EventEmitter {

    /**
     * 数据操作终端
     */
    private dbClient:sequelize.Sequelize;

    /**
     * 当前数据操作的表集合
     */
    private tables:{[key:string]:any} = {};

    constructor() { super();}
    
    async connection(opts:sequelize.Options) {

        if(opts && !opts.logging) {
            opts.logging = this.logHandler.bind(this);
        }
        this.dbClient = new sequelize(opts);
        return await this.dbClient.authenticate();
    }

    async close() {
        if(this.dbClient) {
            await this.dbClient.close();
        }
    }

    /**
     * 按文件加路径加载所有表的配置
     * @param dir 
     */
    async loadModel(dir:string) {
        return new Promise((resolve,reject)=>{
            let files = fs.readdirSync(dir);
            let jsFiles = files.filter((name,index,args:string[])=>{
                return name.endsWith(".js");
            })

            jsFiles.forEach(async f=>{
                console.log(`import model from file ${f}...`);
                let name = f.substr(0,f.length - 3);
                let d = require(path.join(dir,f));
                if(d) {

                    var tableName:string = d.tableName;
                    var tableColumn:sequelize.DefineAttributes = d.column;
                    var opts = d.opts;
                    var sync_opt = d.sync_opt;

                    try {
                        this.defineTable(tableName,tableColumn,opts);
                        await this.dbClient.sync(sync_opt);
                        console.debug(`sync:${tableName} force:${sync_opt.force}`);
                        console.log(d);
                        resolve();
                    }
                    catch(e) {
                        console.error(`define error ${tableName} + ${e}`);
                        reject(e);
                    }
                    // this.dbClient.sync(sync_opt).then(value=>{
                    //     console.debug(`sync:${tableName} force:${sync_opt.force}`);
                    // });
                }
            })
        })
    }

    defineTable<TInst,Attr>(name,attr,opts?:any) {
        var dataModuel = this.dbClient.define<TInst,Attr>(name,attr,opts);
        this.tables[name] = dataModuel;
    }

       /**
     * mysql log 日志输出
     * @param sql 
     * @param time 
     */
    private logHandler(sql: string, time: number) {
        console.debug(`sql:${sql} runTime:${time}`);
        let eventParam: any = {
            sql_text: sql.replace('Executed (default):', ''),
            const_time: time
        }
        //this.emit(SequelizeEvents.RECORD, eventParam);
    }

    /**
     * 获取一张数据表的操作对象
     * @param tableName 
     */
    getTable<TInst,Attr>(tableName:string):sequelize.Model<TInst,Attr> {
        return this.tables[tableName];
    }

    get sequelizeClient():sequelize.Sequelize {
        return this.dbClient;
    }
}