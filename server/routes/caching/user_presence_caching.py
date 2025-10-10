#import modules
from flask import Blueprint, jsonify

#import user created files
from modules.database_modules import database
from modules.caching import online_user_caching

#initializing route name and filepath
cache=Blueprint("caching", __name__)

#this route sets the online value per db in redis
@cache.route("/set-online/<id>", methods=["POST"])
def set_online(id):
    conn=None
    
    try:
        conn, cursor=database.connect()
        
        #check that user exists in the db
        cursor.execute(
            'SELECT username FROM users WHERE id = ?',
            (int(id),)
        )
        username=cursor.fetchone()
        if not username:
            print(f"Not found   source: {__name__}")
            return jsonify({"message": "Not found"}), 404
        
        #load into redis db
        online_user_caching.set_online_status(id)
        print(f"{username[0]} online status saved to cache") #log
        return jsonify({"message": "Success"}), 200 #frontend response
        
    except Exception as e:
        print(f"{e}   source: {__name__}") #log
        return jsonify({"message": "Server Error"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()
            


