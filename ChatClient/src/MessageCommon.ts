import { SimpleCommand } from "chatcommon/src/Commands";
import { IProtocol } from "chatcommon/src/IProtocol";
import { iSocket } from "chatcommon/src/iSocket";


export class MessageCommon extends SimpleCommand {
    constructor(){
        super();
    }

    receiver(protocol:IProtocol,sock:iSocket):void {
        
    }
}