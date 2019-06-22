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
const MySqlClient_1 = require("./MySqlClient");
class MySqlDBMgr {
    constructor() {
        this.configs = {};
        this.clients = {};
    }
    createMySql(connectCfg) {
        return __awaiter(this, void 0, void 0, function* () {
            var mySqlClient = new MySqlClient_1.MySqlClient();
            try {
                yield mySqlClient.connection(connectCfg);
            }
            catch (e) {
                throw new Error(`mySql 链接失败:${connectCfg.host}:${connectCfg.port}`);
            }
            this.configs[connectCfg.host] = connectCfg;
            this.clients[connectCfg.host] = mySqlClient;
            return mySqlClient;
        });
    }
    getMySqlClient(host) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clients[host] || null;
        });
    }
}
exports.mySqlMgr = new MySqlDBMgr();
