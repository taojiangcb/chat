"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protocol = require("./IProtocol");
const Error_1 = require("./Error");
const chatcommon = {
    protocol,
    error_code: Error_1.ERROR_CODE,
    error_msg: Error_1.ERROR_MSG,
};
module.exports = chatcommon;
