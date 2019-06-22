"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IProtocolType;
(function (IProtocolType) {
    IProtocolType[IProtocolType["register"] = 100] = "register";
    IProtocolType[IProtocolType["watch"] = 101] = "watch";
    IProtocolType[IProtocolType["watchOk"] = 102] = "watchOk";
    IProtocolType[IProtocolType["message"] = 103] = "message";
    IProtocolType[IProtocolType["status"] = 104] = "status";
    IProtocolType[IProtocolType["registerSucceed"] = 105] = "registerSucceed";
    IProtocolType[IProtocolType["joinChannel"] = 106] = "joinChannel";
    IProtocolType[IProtocolType["levelChannel"] = 107] = "levelChannel"; //离开房间
})(IProtocolType = exports.IProtocolType || (exports.IProtocolType = {}));
class BaseResp {
    constructor(success, code, msg, data, note) {
        this.success = success;
        this.code = code;
        this.msg = msg;
        this.data = data;
        this.note = note;
    }
}
exports.BaseResp = BaseResp;
