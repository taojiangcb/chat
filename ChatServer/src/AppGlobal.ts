import { IConfig } from "./conf/IConfig";

export interface AppGlobal extends NodeJS.Global {
    config?:IConfig;
    defaultPort?:number;
}