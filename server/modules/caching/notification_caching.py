#import modules
import redis
import os

# initialize connection, separate db number from presence so counters and presence sets never collide
r = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT")),
    db=int(os.getenv("NOTIFICATION_DB")),
    decode_responses=True
)

#called once on a fresh unread notification, o(1) instead of a count query per badge render
def increment_unread(user_id):
    try:
        r.incr(f"user:unread:{user_id}")
    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

#called when notifications get marked read, count is a signed decrement not just -1 since batches vary
def decrement_unread(user_id, by=1):
    try:
        key = f"user:unread:{user_id}"
        new_val = r.decrby(key, by)
        if new_val < 0:
            r.set(key, 0) #guard against drift ever going negative
    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

#read the cached count, caller falls back to the db count on a cache miss
def get_cached_unread(user_id):
    try:
        val = r.get(f"user:unread:{user_id}")
        return int(val) if val is not None else None
    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

#used to resync redis from the db, on cache miss or after a manual correction
def set_unread(user_id, count):
    try:
        r.set(f"user:unread:{user_id}", count)
    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")