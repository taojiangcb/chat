"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Channel_1 = require("./Channel");
const app_1 = require("../../app");
const Log_1 = require("chatcommon/src/log/Log");
class Product {
    constructor() {
        this.DEFAULT_CHANNEL = "/";
        this.clients = {};
        this.products = {};
        this.connect_count = {};
    }
    addClient(cli) {
        var uid = cli.watchBody ? cli.watchBody.userId : "";
        this.clients[uid] = cli;
        var product = cli.watchBody.product;
        this.addProduct(product);
        this.watchChannel(product, this.DEFAULT_CHANNEL, uid);
        var count = this.connect_count[product] || 0;
        count++;
        this.connect_count[product] = count;
        Log_1.Log.infoLog(`添加一个新的连接:${JSON.stringify(uid || 'undefined')} 当前人数为${count}`);
    }
    removeClient(uid, product) {
        var cli = this.clients[uid];
        if (cli) {
            var product = cli.watchBody.product;
            var count = this.connect_count[product] || 0;
            count = count > 0 ? count - 1 : 0;
            this.connect_count[product] = count;
            Log_1.Log.infoLog(`删除一个连接:${JSON.stringify(cli.watchBody || 'undefined')}  当前人数为${count}`);
            this.unWatchChannelAll(product, uid);
            if (count == 0) {
                this.delProduct(product);
            }
            delete this.clients[uid];
        }
    }
    addProduct(product) {
        var defaultChannel = new Channel_1.Channel(this.DEFAULT_CHANNEL);
        var channels = this.products[product];
        if (channels) {
            var defChannel = this.findChannelByName(this.DEFAULT_CHANNEL, channels);
            if (!defChannel) {
                channels.push(defaultChannel);
            }
        }
        else {
            this.products[product] = [defaultChannel];
            Log_1.Log.infoLog(`添加一个新的产品:${product}`);
        }
    }
    delProduct(product) {
        var channels = this.products[product];
        if (channels) {
            delete this.products[product];
            Log_1.Log.infoLog(`删除一个产品:${product}`);
        }
    }
    addChannel(product, channelName) {
        var channels = this.products[product];
        if (channels) {
            var addChannel = this.findChannelByName(channelName, channels);
            if (!addChannel) {
                addChannel = new Channel_1.Channel(channelName);
                channels.push(addChannel);
                this.products[product] = channels;
                Log_1.Log.infoLog(`${product} = 创建channel ${channelName}`);
            }
            return addChannel;
        }
        return null;
    }
    watchChannel(product, channelName, uid) {
        var channels = this.products[product];
        if (channels) {
            var channel = this.findChannelByName(channelName, channels);
            if (channel) {
                channel.addUser(uid);
                Log_1.Log.infoLog(`${uid}  进入 -- channel ${channelName}`);
            }
            else {
                channel = this.addChannel(product, channelName);
                channel.addUser(uid);
                Log_1.Log.infoLog(`${uid} 进入 ** channel ${channelName}`);
            }
        }
    }
    unWatchChannel(product, channelName, uid) {
        var channels = this.products[product];
        if (channels) {
            var channel = this.findChannelByName(channelName, channels);
            if (channel) {
                channel.removeUser(uid);
                Log_1.Log.infoLog(`${uid} 离开 channel ${channelName}`);
                if (channel.ids.length === 0) {
                    Log_1.Log.infoLog(`${uid} 离开 channel ${channelName} 人数为 0 将要被销毁`);
                    this.delChannel(product, channelName);
                }
            }
        }
    }
    unWatchChannelAll(product, uid) {
        var channels = this.products[product];
        if (channels) {
            for (var channel of channels) {
                this.unWatchChannel(product, channel.name, uid);
            }
        }
    }
    delChannel(product, channelName) {
        if (channelName === this.DEFAULT_CHANNEL) {
            Log_1.Log.infoLog(`默认channel:'/' 不能被销毁`);
            return;
        }
        var channels = this.products[product];
        if (channels) {
            var existChannel = this.findChannelByName(channelName, channels);
            if (existChannel) {
                var index = channels.indexOf(existChannel);
                channels.splice(index, 1);
                Log_1.Log.infoLog(`${product} 销毁 channel ${channelName}`);
            }
        }
    }
    findChannelByName(channelName, channels) {
        var find = null;
        channels.forEach(element => {
            if (element.name === channelName) {
                find = element;
            }
        });
        return find;
    }
    getStatus() {
        var names = [];
        var count = 0;
        for (var key in this.products) {
            var channels = this.products[key];
            if (channels) {
                for (var i = 0; i < channels.length; i++) {
                    names.push(channels[i].name);
                }
            }
            count += this.connect_count[key] || 0;
        }
        return {
            svr_name: app_1.appGlobal.config.svr_name,
            products: Object.keys(this.products),
            channels: names,
            collect_count: count
        };
    }
    existClient(uid) {
        let cls = this.clients[uid];
        if (cls) {
            return true;
        }
        return false;
    }
}
exports.Product = Product;
exports.product = new Product();
//# sourceMappingURL=Product.js.map