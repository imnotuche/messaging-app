#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request
import json

#import user created modules
from modules.database_modules import database

#initialzing route name and filepath
friend=Blueprint("accept", __name__)


#route to accept friend request
@friend.route("/accept-request", methods=["POST"])
def accept_request():
    data=request.args
    conn=None
    
    try:
        #find and change field value in the db
        conn, cursor=database.connect()
        cursor.execute(
            f"""
                UPDATE friendships
                SET status = ?,
                    last_action = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_1 = ? AND user_2 = ?
            """,
            (
                "friends",
                data["user_id"],
                min(data["user_id"], data["sent_from"]),
                max(data["user_id"], data["sent_from"])
            )
        )
        
        conn.commit()
        
        print(f"Successfully sent response    source:{__name__}") #log message
        return jsonify({"message":f"request accepted"}), 200 #frontend response
    
    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()