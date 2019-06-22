import { networkInterfaces } from "os";

/**
 * 获取本地ip服务器
 */
export function localIP(): string {
    var interfaces = networkInterfaces();
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