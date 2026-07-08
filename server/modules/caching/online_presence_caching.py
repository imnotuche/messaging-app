#import modules
import redis
import os

# initialize connection
r = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT")),
    db=int(os.getenv("ONLINE_USER_DB")),
    decode_responses=True
)

#store online status and socket id in redis
def set_online_status(user_id, s_id):
    try:
        key = f"user:{user_id}"
        r.hset(key, "status", "online")
        r.hset(key, "s_id", s_id)
        r.expire(key, 60) #expire in 1 minute
    except Exception as e:
        raise Exception(f"{e}  source: {__name__}")

#check online status in redis
def check_online_status(user_id):
    try:
        key = f"user:{user_id}"
        return bool(r.exists(key))
    except Exception as e:
        raise Exception(f"{e}  source: {__name__}")

#return the r object for external use
def get_redis_obj():
    return r