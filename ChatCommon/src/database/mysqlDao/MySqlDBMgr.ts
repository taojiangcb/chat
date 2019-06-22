import sequelize = require("sequelize");
import { MySqlClient } from "./MySqlClient";
import { connect } from "tls";

class MySqlDBMgr {

    private configs:{[key:string]:sequelize.Options} = {};
    private clients:{[key:string]:MySqlClient} = {};

    constructor(){}

    async createMySql(connectCfg:sequelize.Options) {
        var mySqlClient:MySqlClient = new MySqlClient();
        try {
            await mySqlClient.connection(connectCfg);
        } 
        catch(e) {
            throw new Error(`mySql 链接失败:${connectCfg.host}:${connectCfg.port}`);
        }

        this.configs[connectCfg.host] = connectCfg;
        this.clients[connectCfg.host] = mySqlClient;
        return mySqlClient;
    }

    async getMySqlClient(host:string){
        return this.clients[host] || null;
    }
}

export var mySqlMgr = new MySqlDBMgr();