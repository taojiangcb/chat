export interface IConfig {
    gateway_host:string;                  //网关服务地址
    gateway_port:number;                  //网关服务端口 - 3033 默认
    svr_name:string;                      //本服务名称
    writeLogFile?:boolean;                  
    chat_host:string;                     //本服务的域名    
    chat_port:number;                     //本服务的端口 - 8091
}