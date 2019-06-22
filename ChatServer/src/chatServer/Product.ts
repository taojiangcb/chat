import { ChatClient } from "./ChatClient";
import { Channel } from "./Channel";
import { IProtocol, IProtocolType, IChannelBody, IRegisterBody, IStatusBody } from "chatcommon/src/IProtocol";
import { appGlobal } from "../../app";
import { Log } from "chatcommon/src/log/Log";


export class Product {
    
    DEFAULT_CHANNEL:string = "/";                                           //默认的聊天频道
    
    clients: { [key: string]: ChatClient } = {};                        
    products: { [key: string]: Channel[] } = {};
    connect_count:{[key:string]:number} = {}

    /**
     * 添加一个客户端
     * @param cli 
     */
    addClient(cli:ChatClient):void {
        /**当前连接进来的用户id */
        var uid:string = cli.watchBody ? cli.watchBody.userId : "";
        this.clients[uid] = cli;

        var product:string = cli.watchBody.product;

        this.addProduct(product);
        this.watchChannel(product,this.DEFAULT_CHANNEL,uid);          //关注默认频道信息
        
        //**当前产品的总连接数 */
        var count:number = this.connect_count[product] || 0;
        count++;
        this.connect_count[product] = count;
        Log.infoLog(`添加一个新的连接:${JSON.stringify(uid || 'undefined')} 当前人数为${count}`);
    }

    /**
     * 删除一个客户端
     * @param uid 
     * @param product 
     */
    removeClient(uid:string,product:string):void {
        var cli:ChatClient = this.clients[uid];
        if(cli) {

            var product:string = cli.watchBody.product;
            var count:number = this.connect_count[product] || 0;
            
            count = count > 0 ? count - 1 : 0;
            this.connect_count[product] = count;

            Log.infoLog(`删除一个连接:${JSON.stringify(cli.watchBody || 'undefined')}  当前人数为${count}`);
            this.unWatchChannelAll(product,uid);

            if(count == 0) { this.delProduct(product); }
            delete this.clients[uid];

        }
    }
    
    /**
     * 
     * @param product 添加产品
     */
    addProduct(product:string):void {
        //产品默认频道
        var defaultChannel:Channel = new Channel(this.DEFAULT_CHANNEL);
        /**频道列表 */
        var channels:Channel[] = this.products[product];
        if(channels) {
            var defChannel = this.findChannelByName(this.DEFAULT_CHANNEL,channels);
            if(!defChannel) {
                channels.push(defaultChannel);
            }
        }
        else {
            this.products[product] = [defaultChannel];
            Log.infoLog(`添加一个新的产品:${product}`);
        }
    }

    /**删除一个产品 */
    delProduct(product:string):void {
        var channels:Channel[] = this.products[product];
        if(channels) {
            delete this.products[product];
            Log.infoLog(`删除一个产品:${product}`);
        }
    }
    
    /**
     * 给产品添加一个频道
     * @param product 
     * @param channelName 
     */
    addChannel(product:string,channelName:string):Channel {
        var channels:Channel[] = this.products[product];
        if(channels) {
            var addChannel:Channel = this.findChannelByName(channelName,channels);
            if(!addChannel) {
                addChannel = new Channel(channelName);
                channels.push(addChannel);
                this.products[product] = channels;
                Log.infoLog(`${product} = 创建channel ${channelName}`);
            }
            return addChannel;
        }
        return null;
    }

    /**关注一个频道消息 */
    watchChannel(product:string,channelName:string,uid:string):void {
        var channels:Channel[] = this.products[product];
        if(channels) {
            var channel = this.findChannelByName(channelName,channels);
            if(channel) {
                channel.addUser(uid);
                Log.infoLog(`${uid}  进入 -- channel ${channelName}`);
            } 
            else {
                channel = this.addChannel(product,channelName)
                channel.addUser(uid);
                Log.infoLog(`${uid} 进入 ** channel ${channelName}`);
            }
        } 
    }

    /**取消一个频道的关注 */
    unWatchChannel(product,channelName:string,uid:string):void {
        var channels:Channel[] = this.products[product];
        if(channels) {
            var channel = this.findChannelByName(channelName,channels);
            if(channel) {
                channel.removeUser(uid);
                Log.infoLog(`${uid} 离开 channel ${channelName}`);
                if(channel.ids.length === 0) {
                    Log.infoLog(`${uid} 离开 channel ${channelName} 人数为 0 将要被销毁`);
                    this.delChannel(product,channelName);
                }
            }
        }
    }

    /**
     * 取消所有频道关注
     * @param product 
     * @param uid 
     */
    unWatchChannelAll(product,uid:string):void {
        var channels:Channel[] = this.products[product];
        if(channels) {
            for(var channel of channels) {
                this.unWatchChannel(product,channel.name,uid);
            }
        }
    }


    /**删除一个频道 */
    delChannel(product:string,channelName:string):void {
        if(channelName === this.DEFAULT_CHANNEL) {
            Log.infoLog(`默认channel:'/' 不能被销毁`);
            return ;    //默认频道不能删除
        }

        var channels:Channel[] = this.products[product];
        if(channels) {
            var existChannel:Channel = this.findChannelByName(channelName,channels);
            if(existChannel) {
                var index:number = channels.indexOf(existChannel);
                channels.splice(index,1);
                Log.infoLog(`${product} 销毁 channel ${channelName}`);
            }
        }
    }

    /**
     * 查找一个频道
     * @param channelName 
     * @param channels 
     */
    findChannelByName(channelName:string,channels:Channel[]):Channel {
        var find:Channel = null;
        channels.forEach(element => {
            if(element.name === channelName) {
                find = element;
            }
        });
        return find;
    }   

    /** * 获取当前的服务状态信息 */
    getStatus():IStatusBody {
        var names:string[] = [];
        var count:number = 0;
        for(var key in this.products) {
            var channels:Channel[] = this.products[key];
            if(channels) {
                for(var i = 0; i < channels.length;i++) {
                    names.push(channels[i].name);
                }
            }
            count += this.connect_count[key] || 0;
        }
        return {
            svr_name:appGlobal.config.svr_name,
            products:Object.keys(this.products),
            channels:names,
            collect_count:count
        }
    }

    /**
     * 判断客户端是否存在
     * @param uid 
     */
    existClient(uid:string):Boolean {
        let cls:ChatClient = this.clients[uid];
        if(cls) {
            return true;
        }
        return false;
    }
}

export var product = new Product();

