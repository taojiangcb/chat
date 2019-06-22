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
const path = require("path");
const fs = require("fs");
const http_1 = require("./src/utils/http");
const conf_url = path.parse(__dirname).dir;
const env_str = process.env.NODE_ENV;
const conf_str = String(fs.readFileSync(`${conf_url}/config_${env_str}.json`));
let conf = JSON.parse(conf_str);
var main = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let chat_svr_regist = yield http_1.httpRequest.post(conf.gateway_url);
        if (chat_svr_regist) {
        }
    });
}();
//# sourceMappingURL=app.js.map