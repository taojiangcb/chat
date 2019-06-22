import { exec, execSync, spawn } from "child_process";
import { EventEmitter } from "events";
const moment = require("moment");

var project = "platServer";
class Publisher extends EventEmitter {
    constructor() {
        super();
        process.stdin.on('data', (input) => {
            this.emit("input", input);
        });
        process.on('exit', (code) => { this.printMsg("退出码:" + code) });
        process.stdin.setEncoding('utf8');
    }

    async start() {
        this.printMsg("请输入版本号:");
        var version = await this.getPrint();
        var arr = [project, version, moment().format("YYYYMMDD")]
        var tagName = arr.join("_");
        this.printMsg("版本目录:" + tagName);
        this.printMsg("开始编译");
        var result = await this.exec("tsc -p tsconfig.json");
        console.log("编译结束" + result.toString())
        var svnPath = `svn://121.40.42.190/danji/qygame/tags/${tagName}`;
        await this.exec("svn delete " + svnPath + " -m \"no used version\"");
        await this.exec(`rd tmp\\${tagName} /S/Q`);
        await this.exec(`svn mkdir ${svnPath} -m "tag version directory create"`);
        await this.exec(`svn co ${svnPath} tmp/${tagName}`);
        await this.exec(`xcopy bin\\* tmp\\${tagName} /Y/S /exclude:Exclude.txt`);
        await this.exec(`xcopy config_*.json tmp\\${tagName}\\ /Y`);
        await this.exec(`xcopy doc\\*.sh tmp\\${tagName}\\ /Y`)
        await this.exec(`copy package.json tmp\\${tagName} /Y`);
        await this.exec(`copy package-lock.json tmp\\${tagName} /Y`);
        await this.exec(`copy yarn.lock tmp\\${tagName} /Y`);
        await this.exec(`svn add tmp\\${tagName} --no-ignore --force`);
        await this.exec(`svn commit tmp\\${tagName} -m "tag version commit"`)
        this.printMsg("提交结束");
        this.close(0);
    }

    async exec(cmd: string, count: number = 0) {
        return new Promise((resolve, reject) => {
            var t = Date.now();
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    console.log("执行失败:" + cmd);
                    resolve(err);
                    return;
                }
                this.printMsg("执行成功:" + cmd + "         耗时(" + (Date.now() - t) + ")毫秒");
                resolve(stdout);
            })
        });
    }


    printMsg(msg: string) {
        console.log(msg);
    }

    async getPrint() {
        return new Promise((resolve, reject) => {
            this.once("input", (input: string) => {
                resolve(input.replace(/\r\n/g, ""));
            })
        });
    }

    close(code) {
        process.exit(code);
    }
}

var builder = new Publisher();
builder.start();