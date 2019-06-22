import {RedisHelp} from "chatcommon/src/database/redisBase/RedisHelp"

class PlatRedis {
    redis_client:RedisHelp 
}

export var platRedis = new PlatRedis();
