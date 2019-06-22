
export class Channel {
    name:string;
    ids:string[];
    
    constructor(name:string){
        this.name = name;
        this.ids = [];
    }

    /**
     * @param id 加入用户
     */
    addUser(id:string):string[] {
        if(this.ids.indexOf(id) == -1) {
            this.ids.push(id);
        }
        return this.ids;
    }

    /**
     * @param id 删除用户
     */
    removeUser(id:string):string[] {
        var index:number = this.ids.indexOf(id);
        if(index > -1) {
            this.ids.splice(index,1)
        }
        return this.ids;
    }
}