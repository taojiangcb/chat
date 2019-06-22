type ErrorMsg = {code:number,msg:string};

export enum ERROR_CODE {

    ERROR_10 = 10,                      //用户未登录
    ERROR_1001 = 1001,                  //登陆失败
    ERROR_1002 = 1002,                  //用户已经存在
    ERROR_1003 = 1003,                  //不是超级管理员
    ERROR_1004 = 1004,                  //权限不够
    
    ERROR_5000 = 5000,                  //入参不正确
    ERROR_5001 = 5001,                  //失败
    ERROR_5002 = 5002,                  //余额不足
    ERROR_5023 = 5023,                  //token认证失败
    ERROR_5024 = 5024,                  //钻石记录入库失败
    ERROR_5025 = 5025,                  //钻石赠送接口未开启
    ERROR_5026 = 5026,                  //签名不正确 
    ERROR_5030 = 5030,                  //获取签名失败
    ERROR_5031 = 5031,                  //充值失败
    ERROR_5044 = 5044,                  //钻石赠送失败
    ERROR_5050 = 5050,                  //支付到账超时
    ERROR_5060 = 5060,                  //ios充值配置异常
    ERROR_500 = 500,

    PLAT_INFO_6001 = 6001,              //获取平台信息失败
    PLAT_INFO_6002 = 6002,              //更新平台用户信息失败

    ERROR_PLAT_6101 = 6101,
    ERROR_PLAT_6102 = 6102,               //游戏添加失败
    ERROR_PLAT_6103 = 6103,               //没有游戏数据
    ERROR_PLAT_6104 = 6104,               //SQL 执行失败
    ERROR_PLAT_6105 = 6105,               //其他用户包含了

    USER_INFO_7001 = 7001,                //用户不存在

    ERROR_BOX_GAME_ADD_ERROR = 8000,      //提交小游戏盒子失败
    ERROR_BOX_GAME_LOGIN_ERROR = 8001,    //游戏盒子登录失败
    ERROR_BOX_GAME_NOT_LOGIN = 8002,      //没有登录

  
}

export const ERROR_MSG = {
    ERROR_10:"用户未登录或者session过期",
    ERROR_500:"数据不存在",
    ERROR_1001:"角色信息不存在或者密码不正确",
    ERROR_1002:"用户已经存在",
    ERROR_1004:"权限不够",
    ERROR_5000:"参数不正确",
    ERROR_5001: "没有管理员",
    ERROR_1003:"不是超级管理员账号",
    ERROR_PLAT_6102: "游戏添加失败",
    ERROR_PLAT_6103: "没有游戏数据",
    ERROR_PLAT_6105:"其他用户包含了该游戏"
}