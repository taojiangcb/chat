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
const child_process_1 = require("child_process");
const events_1 = require("events");
const moment = require("moment");
var project = "ChatServer";
class Publisher extends events_1.EventEmitter {
    constructor() {
        super();
        process.stdin.on('data', (input) => {
            this.emit("input", input);
        });
        process.on('exit', (code) => { this.printMsg("退出码:" + code); });
        process.stdin.setEncoding('utf8');
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            var tagName = project + "_dev";
            this.printMsg("版本目录:" + tagName);
            this.printMsg("开始编译");
            var result = yield this.exec("tsc -p tsconfig.json");
            console.log("编译结束" + result.toString());
            yield this.exec(`rd tmp\\${tagName} /S/Q`);
            yield this.exec(`del tmp\\${tagName}.zip`);
            yield this.exec(`mkdir tmp\\${tagName}`);
            yield this.exec(`xcopy bin\\* tmp\\${tagName} /Y/S /exclude:Exclude.txt`);
            yield this.exec(`xcopy config_*.json tmp\\${tagName}\\ /Y`);
            yield this.exec(`xcopy doc\\*.sh tmp\\${tagName}\\ /Y`);
            yield this.exec(`copy package.json tmp\\${tagName} /Y`);
            yield this.exec(`copy package-lock.json tmp\\${tagName} /Y`);
            yield this.exec(`copy yarn.lock tmp\\${tagName} /Y`);
            this.printMsg("开始压缩");
            const compressUtil = require("compressing");
            yield compressUtil.zip.compressDir(`tmp\\${tagName}`, `tmp\\${tagName}.zip`, { ignoreBase: true });
            this.printMsg("压缩结束");
            this.close(0);
        });
    }
    exec(cmd, count = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var t = Date.now();
                child_process_1.exec(cmd, (err, stdout, stderr) => {
                    if (err) {
                        console.log("执行失败:" + cmd);
                        resolve(err);
                        return;
                    }
                    this.printMsg("执行成功:" + cmd + "         耗时(" + (Date.now() - t) + ")毫秒");
                    resolve(stdout);
                });
            });
        });
    }
    printMsg(msg) {
        console.log(msg);
    }
    getPrint() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.once("input", (input) => {
                    resolve(input.replace(/\r\n/g, ""));
                });
            });
        });
    }
    close(code) {
        process.exit(code);
    }
}
var builder = new Publisher();
builder.start();
//# sourceMappingURL=dev.js.map