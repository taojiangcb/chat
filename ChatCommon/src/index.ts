import protocol = require("./IProtocol");
import { ERROR_CODE, ERROR_MSG } from "./Error";

const chatcommon = {
    protocol,
    error_code:ERROR_CODE,
    error_msg:ERROR_MSG,
}

module.exports = chatcommon