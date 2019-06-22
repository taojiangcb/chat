
export interface IProtocol {
    type:number;                                //消息类型
    in_char_svr:string;                         //消息来源服务器
    msg_body?:any;                              //消息体内容
    to_chat_svr?:string;                         //消息接收服务器
    in_channel?:string;                          //当前所在频道
    to_channel?:string;                          //消息接受频道
    in_product:string;                          //发送消息的产品
    to_product?:string;                          //接收消息的产品
    id:string;                                  //消息的发送者
    toid?:string;                                //消息的接受不了者
}

export enum IProtocolType {
    register = 100,                             //服务器注入
    watch,                                      //GS接入聊天平台
    watchOk,                                    //服务器返回到客户端关注成功
    message,                                    //消息
    status,                                      //chatsvr 状态同步到网关
    registerSucceed,                            //注册成功
    joinChannel,                                //进入房间
    levelChannel                                //离开房间
}

export interface IStatusBody {
    channels:string[];                          //当前服务里所有的频道
    collect_count:number;                       //当前服务里的连接数
    products:string[];                          //当前服务里所有的产品
    svr_name:string;                            //当前服务的名称
}

export interface IRegisterBody {
    ip:string;                                  //聊天服务注册
    port:number;                                //端口
    svr_name:string;                            //服务名称
    token?:string;                              //注册服务器的认证
}

/**客户端链接上来的时候 */
export interface IWatchBody {
    product:string;                             //产品
    userId:string;                              //用户id
    token:string;                               //链接到聊天服务的id
    auth:string;                                //授权认证
    svr?:IRegisterBody                          //关注的服务器信息，在网关服务获取要连接的聊天服务
}

export interface IChannelBody {
    channelName:string;                         //聊天频道的相关操作
    otherUserId:string;                         //其他人的id，如果有其他人进入了channel
}

export class BaseResp {
    success: boolean;
    code: number;
    msg: string;
    data: any;
    note?: string;
    constructor(success: boolean, code: number, msg: string, data?: any, note?: string) {
        this.success = success;
        this.code = code;
        this.msg = msg;
        this.data = data;
        this.note = note;
    }
}

