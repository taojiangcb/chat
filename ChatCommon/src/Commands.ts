import { iSocket } from "./iSocket";
import { IProtocol } from "./IProtocol";

export class SimpleCommand {
    constructor(){}
    receiver(protocol:IProtocol,socket:iSocket):void {}
    send(type:number,socket?:iSocket,...args:any[]){}
}

/**
 * 消息协议的收集管理
 */
export class CommondInterface {

    private handls:Map<Number,SimpleCommand> = new Map<Number,SimpleCommand>();
    
    register(type:number,commond:SimpleCommand):void{
        this.handls[type] = commond;
    }
    
    unregister(type:number):void {
        var cls:any = this.handls[type];
        if(cls) {
            delete this.handls[type];
        }
        return cls;
    }
    
    receiver(type:number,protocol:IProtocol,socket:iSocket){
        var commond:SimpleCommand = this.handls[type];
        if(commond) {
            commond.receiver(protocol,socket);
        }
    }
    
    send(type:number,socket:iSocket,...args:any[]):void {
        var commond:any = this.handls[type];
        if(commond) {
            commond.send.call(commond,type,socket,args);
        }
    }
}

export var commands = new CommondInterface();