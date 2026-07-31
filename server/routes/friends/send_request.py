#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request
import json

#import user created modules
from modules.database_modules import database
from modules.notification_modules import notifications
from modules.caching import notification_caching
from modules import websocket

#loading env variables
secret = os.getenv("JWT_SECRET")

#initialzing route name and filepath
friend=Blueprint("send", __name__)

#route to send friend request
@friend.route("/send-request", methods=["POST"])
def send_friend_request():
    data=request.args
    conn = None

    #verify identity from the cookie instead of trusting a client-supplied user_id
    token = request.cookies.get("logged_in")
    if not token:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        user_id = payload["user"]["id"]
    except Exception as e:
        print(f"JWT Decode Error: {e}   source:{__name__}") #log
        return jsonify({"message": "Unauthorized"}), 401

    #initialize db and create friendship table
    try:
        conn, cursor=database.connect()

        #make sure request hasnt been made
        cursor.execute(
            "SELECT * FROM friendships WHERE user_1 = ? AND user_2 = ? AND status = ?",
            (
                #we store user friendship ids smaller first, then larger
                #so we search for records in that manner
                min(str(user_id), data["send_to"]),
                max(str(user_id), data["send_to"]),
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
                    min(str(user_id), data["send_to"]),
                    max(str(user_id), data["send_to"]),
                    "pending",
                    user_id
                )
        )
        
        conn.commit()

        #fetch a lightweight snapshot of the actor, denormalized into the notification so it stays accurate even if they later rename
        cursor.execute("SELECT name, username, profile FROM users WHERE id = ?", (user_id,))
        actor_row = cursor.fetchone()
        actor_snapshot = {"name": actor_row["name"], "username": actor_row["username"], "profile": actor_row["profile"]} if actor_row else {}

        #create and push the notification, wrapped separately so a notification failure never breaks the actual friend request
        try:
            new_notification = notifications.create_notification(
                recipient_id=int(data["send_to"]),
                actor_id=user_id,
                type_="friend_request",
                payload=actor_snapshot
            )
            notification_caching.increment_unread(int(data["send_to"]))
            websocket.emit_notification(int(data["send_to"]), new_notification)
        except Exception as e:
            print(f"notification failed, friend request still succeeded: {e}   source:{__name__}") #log message

        print(f"Successfully sent request    source:{__name__}") #log message
        return jsonify({"message":"Sent"}), 200 #frontend response
        
    except Exception as e:
        print(f"{e}      source:{__name__}") #log message
        return jsonify({"message":"Unable to send request"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()