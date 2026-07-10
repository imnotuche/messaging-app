#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request
import json

#import user created modules
from modules.database_modules import database

#initialzing route name and filepath
friend=Blueprint("cancel", __name__)


#route to cancel friend request
@friend.route("/cancel-request", methods=["POST"])
def cancel_request():
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
                min(int(data["user_id"]), int(data["send_to"])),
                max(int(data["user_id"]), int(data["send_to"])),
                "pending"
            )
        )
        
        conn.commit()
        
        print(f"Successfully sent response    source:{__name__}") #log message
        return jsonify({"message":f"Friend request cancelled"}), 200 #frontend response
    
    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()