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
const ChatClient_1 = require("./src/ChatClient");
var chatClient;
var main = function () {
    return __awaiter(this, void 0, void 0, function* () {
        var opts = {
            gateway_url: "http://127.27.8.15:8090/chatServer/get",
            product: "test",
            auth: "12306",
            userId: "12306",
        };
        chatClient = new ChatClient_1.ChatClient(opts);
    });
}();
//# sourceMappingURL=app.js.map