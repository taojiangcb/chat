import { chatIo } from "../ChatIO";
import { IProtocol, IProtocolType } from "chatcommon/src/IProtocol";
import { SimpleCommand } from "chatcommon/src/Commands";
import { iSocket } from "chatcommon/src/iSocket";

export class MessageCommand extends SimpleCommand {
    constructor(){super()}
    receiver(protocol:IProtocol,socket:iSocket):void {
        var type:number = protocol.type;
        switch(type) {
            case IProtocolType.message:
                chatIo.send(protocol);
                break;
        }
    }
}