

export interface IConfig {
    WSPort?:number;                 //转发服务的端口
    ChildProcessNum:number;         // 启动的进程个数
    APIGatewayUrl:string;           // 8090 端口
    my_sql:{
        connectionLimit:number;
        host:string;
        port:number;
        user:string;
        password:string;
        database:string;
        tables?:string[];
    },
    redis:{
        ip:string;
        port:number;
        select:number;
        flag:{
            auth_pass:string
        }
    }
}