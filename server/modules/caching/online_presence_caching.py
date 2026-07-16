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

#add a socket id to the users connection set, one entry per tab/device
def add_connection(user_id, sid):
    try:
        key = f"user:online:{user_id}"
        r.sadd(key, sid)
        r.expire(key, 60) #ttl backup incase disconnect never fires
    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

#remove a socket id, returns how many connections remain for this user
def remove_connection(user_id, sid):
    try:
        key = f"user:online:{user_id}"
        r.srem(key, sid)
        remaining = r.scard(key)
        if remaining == 0:
            r.delete(key)
        return remaining
    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

#keeps the set alive on heartbeat, doesnt touch membership
def refresh_connection(user_id):
    try:
        key = f"user:online:{user_id}"
        r.expire(key, 60)
    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

#online if the set exists and has at least one active socket
def check_online_status(user_id):
    try:
        key = f"user:online:{user_id}"
        return r.exists(key) and r.scard(key) > 0
    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

#return the r object for external use
def get_redis_obj():
    return r