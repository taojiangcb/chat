
import app = require("../app")
import WebSocket = require("ws")
import { debug } from "util";
import { Log } from "chatcommon/src/log/Log";
import { IProtocol, IWatchBody, IProtocolType } from "chatcommon/src/IProtocol";
import { timingSafeEqual } from "crypto";

var ws;
describe("测试sdkPlat", function () {
    before(() => { app.appGlobal; })
    this.timeout(50000)
    it("测试一个客户客户端链接", (done) => {
        setTimeout(()=>{
            ws = new WebSocket("ws://127.0.0.1:8899");
            ws.on("open", () => {
                Log.debug("链接成功");
                Log.debug(JSON.stringify(protoco));
            })
            ws.on("close", () => {
                Log.debug("链接断开");
            })

            ws.on("message", (data: WebSocket.Data) => {
                var msg: string = String(data);
                Log.debug("receiver ============" + msg);
                done();
            })

            var watchBody: IWatchBody = {
                product: "test_",
                userId: "12306",
                token: "",
                svr: {
                    ip: "127.0.0.1",
                    port: 8091,
                    svr_name: "test_12306"
                }
            }

            var protoco: IProtocol = {
                in_char_svr: "test_12306",
                in_product: "test_",
                msg_body: watchBody,
                id: "",
                type: IProtocolType.watch
            }
        },5000)
    })
})