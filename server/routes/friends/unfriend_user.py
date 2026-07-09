#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request
import json

#import user created modules
from modules.database_modules import database

#initialzing route name and filepath
friend=Blueprint("friend", __name__)


#route to unfriend user
@friend.route("/unfriend", methods=["POST"])
def unfriend_user():
    data=request.args
    conn=None
    
    try:
        #find and delete field value from the db
        conn, cursor=database.connect()
        cursor.execute(
            f"""
                DELETE FROM friendships
                WHERE user_1 = ? AND user_2 = ? AND status = ?
            """,
            (
                min(int(data["user_id"]), int(data["friend_id"])),
                max(int(data["user_id"]), int(data["friend_id"])),
                "friends"
            )
        )
        
        conn.commit()
        
        print(f"Successfully sent response    source:{__name__}") #log message
        return jsonify({"message":f"You unfriended @{data['friend_username']}"}), 200 #frontend response
    
    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()