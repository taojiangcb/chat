export interface IConfig {
    ws_port:number;
    http_port:number;
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
    writeLogFile:boolean;
}