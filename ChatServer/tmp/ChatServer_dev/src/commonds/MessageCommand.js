"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = require("../chatServer/Product");
const ChatClient_1 = require("../chatServer/ChatClient");
const GatewayClient_1 = require("../gateway/GatewayClient");
const Commands_1 = require("chatcommon/src/Commands");
const app_1 = require("../../app");
class MessageCommand extends Commands_1.SimpleCommand {
    constructor() { super(); }
    receiver(protocol, socket) {
        const toSvr = protocol.to_chat_svr || "";
        if (toSvr === app_1.appGlobal.config.svr_name || !toSvr || (toSvr === "*" && socket instanceof GatewayClient_1.GatewayClient)) {
            const product_name = protocol.to_product || protocol.in_product;
            const channel_name = protocol.to_channel || Product_1.product.DEFAULT_CHANNEL;
            if (product_name) {
                if (protocol.toid) {
                    let cli = Product_1.product.clients[protocol.toid];
                    if (cli) {
                        cli.send(protocol);
                    }
                }
                else {
                    const product_elements = product_name.split("##");
                    const product_start = product_elements[1] === "*";
                    const product_games = product_elements[0];
                    if (product_start) {
                        var keys = Object.keys(Product_1.product.products);
                        for (var i = 0; i < keys.length; i++) {
                            if (keys[i].indexOf(product_games) === 0) {
                                this.sendByProduct(keys[i], channel_name, protocol, socket);
                            }
                        }
                    }
                    else {
                        this.sendByProduct(product_name, channel_name, protocol, socket);
                    }
                }
            }
        }
        else if (socket instanceof ChatClient_1.ChatClient) {
            GatewayClient_1.gatewayClient.send(protocol);
        }
    }
    sendByProduct(product_name, channel_name, protocol, socket) {
        let channels = Product_1.product.products[product_name];
        if (channels) {
            if (channel_name === "*") {
                for (let product_channel of channels) {
                    this.sendByChannel(product_channel, protocol, socket);
                }
            }
            else {
                let product_channel = Product_1.product.findChannelByName(channel_name, channels);
                this.sendByChannel(product_channel, protocol, socket);
            }
        }
    }
    sendByChannel(product_channel, protocol, socket) {
        if (product_channel) {
            for (var i = 0; i < product_channel.ids.length; i++) {
                const id = product_channel.ids[i];
                if (id !== protocol.id) {
                    let cli = Product_1.product.clients[id];
                    if (cli) {
                        cli.send(protocol);
                    }
                }
            }
        }
    }
}
exports.MessageCommand = MessageCommand;
//# sourceMappingURL=MessageCommand.js.map