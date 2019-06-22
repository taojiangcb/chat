
import {RedisHelp} from "chatcommon/src/database/redisBase/RedisHelp"

class PlatRedis {
    redisCli:RedisHelp;
}

export var platRedis = new PlatRedis();