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

#store online status in redis
def set_online_status(user_id):
    key = f"user:{user_id}"
    r.hset(key, "status", "online")
    r.expire(key, 60)

def check_online_status(user_id):
    key = f"user:{user_id}"
    return bool(r.exists(key))