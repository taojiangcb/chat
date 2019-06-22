import { IConfig } from "./src/conf/IConfig";


export interface AppGlobal extends NodeJS.Global {
    config?:IConfig;
}