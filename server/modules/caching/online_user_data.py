#import modules
import redis, json
import os

# initialize connection
r = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT")),
    db=int(os.getenv("USER_DATA_DB")),
    decode_responses=True
)

#store user data in redis
def set_user_data(data):
    try:
        key = f"user:{data['user_id']}"
        r.set(key, json.dumps(data))
        r.expire(key, 3600)
        print(f"{key} loaded into memory")
    except Exception as e:
        print(f"{e}    source: {__name__}")
        raise Exception(f"{e}")


#fetch and return user data in redis
def fetch_user_data(id):
    try:
        key=f"user:{id}"
        raw=r.get(key)
        
        if raw is None:
            return None
        
        data=json.loads(raw)
        r.expire(key, 3600) #reset expiry
        print(f"{key} fetched from memory")
        return data
    except Exception as e:
        print(f"{e}    source: {__name__}")
        raise Exception(f"{e}")


#scan memory keys and return partial profile matches
def search_cached_profiles(query):
    try:
        matched_profiles = []
        lower_query = query.lower()
        
        # safely iterate over all keys matching the user pattern
        for key in r.scan_iter("user:*"):
            raw = r.get(key)
            if raw:
                data = json.loads(raw)
                
                # check for substring match across username, name, and email fields
                username = data.get("username", "").lower()
                name = data.get("name", "").lower()
                email = data.get("email", "").lower()
                
                if lower_query in username or lower_query in name or lower_query in email:
                    matched_profiles.append(data)
                    
        if matched_profiles:
            print(f"Matched {len(matched_profiles)} partial queries from scan    source: {__name__}")
            
        return matched_profiles
    except Exception as e:
        print(f"{e}    source: {__name__}")
        raise Exception(f"{e}")

