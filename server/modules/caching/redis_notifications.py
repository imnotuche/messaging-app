#import modules
import redis
import os

# this function listens for expired keys and emits a websocket
def listen_for_expired_keys(db, socketio):
    
    # initialize connection
    r = redis.Redis(
        host=os.getenv("REDIS_HOST"), 
        port=int(os.getenv("REDIS_PORT"))
    )
    
    #Enable Redis keyspace notifications for expired keys
    r.config_set('notify-keyspace-events', 'Ex')

    pubsub = r.pubsub()

    # subscribe to specified DB
    pubsub.psubscribe(f'__keyevent@{db}__:expired')

    print(f"Listening for expired keys on DB: {db}") #log

    for msg in pubsub.listen():
        if msg['type'] == 'pmessage':
            expired_key = msg['data'].decode()
            print(f"Expired key: {expired_key}")

