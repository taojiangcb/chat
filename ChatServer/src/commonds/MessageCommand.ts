import { IProtocol, IProtocolType, IChannelBody } from "chatcommon/src/IProtocol";
import { Channel } from "../chatServer/Channel";
import { product } from "../chatServer/Product";
import { ChatClient } from "../chatServer/ChatClient";
import { gatewayClient, GatewayClient } from "../gateway/GatewayClient";
import { SimpleCommand } from "chatcommon/src/Commands";
import { iSocket } from "chatcommon/src/iSocket";
import { appGlobal } from "../../app";

/**
 * 聊天消息处理
 * 聊天优先级别 : 服务 > 产品 > 私聊 > 频道
 */
export class MessageCommand extends SimpleCommand {
    constructor() { super() }
    receiver(protocol: IProtocol, socket: iSocket): void {
        //消息服务
        const toSvr: string = protocol.to_chat_svr || "";
        if (toSvr === appGlobal.config.svr_name || !toSvr || (toSvr === "*" && socket instanceof GatewayClient)) {
            const product_name: string = protocol.to_product || protocol.in_product;                 //产品
            const channel_name: string = protocol.to_channel || product.DEFAULT_CHANNEL;             //频道
            if (product_name) {
                //私聊
                if (protocol.toid) {
                    let cli: ChatClient = product.clients[protocol.toid];
                    if (cli) {
                        cli.send(protocol);
                    }
                }
                //频道聊天
                else {
                    const product_elements:string[] = product_name.split("##");
                    const product_start: Boolean = product_elements[1] === "*";
                    const product_games:string = product_elements[0];
                    if (product_start) {
                        var keys:string[] = Object.keys(product.products);
                        for(var i = 0; i < keys.length; i++) {
                            if(keys[i].indexOf(product_games) === 0) {
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
        //消息发送的网关服务
        else if (socket instanceof ChatClient) {
            gatewayClient.send(protocol);
        }
    }

    private sendByProduct(product_name: string, channel_name: string, protocol: IProtocol, socket: iSocket) {
        let channels: Channel[] = product.products[product_name];
        if (channels) {
            if (channel_name === "*") {
                for(let product_channel of channels) {
                    this.sendByChannel(product_channel,protocol,socket);
                }
            }
            else {
                let product_channel: Channel = product.findChannelByName(channel_name, channels);
                this.sendByChannel(product_channel,protocol,socket);
            }

        }
    }
    private sendByChannel(product_channel: Channel, protocol, socket: iSocket) {
        if (product_channel) {
            for (var i: number = 0; i < product_channel.ids.length; i++) {
                const id: string = product_channel.ids[i];
                //过滤自己
                if (id !== protocol.id) {
                    let cli: ChatClient = product.clients[id];
                    if (cli) {
                        cli.send(protocol);
                    }
                }
            }
        }
    }
}