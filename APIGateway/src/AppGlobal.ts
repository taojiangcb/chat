import { IConfig } from "./conf/IConfig";

export interface AppGlobal extends NodeJS.Global {
    config?:IConfig;
    rootPath?:string;
}