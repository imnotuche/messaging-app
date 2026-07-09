#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request
import json

#import user created modules
from modules.database_modules import database

#initialzing route name and filepath
friend=Blueprint("friend", __name__)

#route to send friend request
@friend.route("/friend-request", methods=["POST"])
def send_friend_request():
    data=request.get_json()
    conn = None

    #initialize db and create friendship table
    try:
        conn, cursor=database.connect()

        #make sure request hasnt been made
        cursor.execute(
            "SELECT * FROM friendships WHERE user_1 = ? AND user_2 = ? AND status = ?",
            (
                #we store user friendship ids smaller first, then larger
                #so we search for records in that manner
                min(data["user_id"], data["sent_to"]),
                max(data["user_id"], data["sent_to"]),
                "pending"
            )
        )
        existing_record=cursor.fetchone()
        if existing_record:
            print(f"request already exists   source:{__name__}") #log message
            return jsonify({"message":"Friend request already sent"}), 409 #frontend response
        
        #insert data into table
        cursor.execute(
            "INSERT INTO friendships (user_1, user_2, status, last_action, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                (
                    #users inserted in ascending order
                    min(data["user_id"], data["sent_to"]),
                    max(data["user_id"], data["sent_to"]),
                    "pending",
                    int(data["user_id"])
                )
        )
        
        conn.commit()
        print(f"Successfully sent request    source:{__name__}") #log message
        return jsonify({"message":"Sent"}), 200 #frontend response
        
    except Exception as e:
        print(f"{e}      source:{__name__}") #log message
        return jsonify({"message":"Unable to send request"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()