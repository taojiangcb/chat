"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
function localIP() {
    var interfaces = os_1.networkInterfaces();
    for (var k in interfaces) {
        var iface = interfaces[k];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            console.log(alias);
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return "";
}
exports.localIP = localIP;
//# sourceMappingURL=GetIP.js.map