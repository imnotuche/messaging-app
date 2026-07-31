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
friend=Blueprint("accept", __name__)


#route to accept friend request
@friend.route("/accept-request", methods=["POST"])
def accept_request():
    data=request.args
    conn=None

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
                user_id,
                min(str(user_id), data["sent_from"]),
                max(str(user_id), data["sent_from"])
            )
        )
        
        conn.commit()

        #fetch a lightweight snapshot of the actor (the accepter), denormalized into the notification
        cursor.execute("SELECT name, username, profile FROM users WHERE id = ?", (user_id,))
        actor_row = cursor.fetchone()
        actor_snapshot = {"name": actor_row["name"], "username": actor_row["username"], "profile": actor_row["profile"]} if actor_row else {}

        #notify the original sender, and silence their now-stale "sent you a request" notification
        try:
            new_notification = notifications.create_notification(
                recipient_id=int(data["sent_from"]),
                actor_id=user_id,
                type_="friend_accept",
                payload=actor_snapshot
            )
            notification_caching.increment_unread(int(data["sent_from"]))
            websocket.emit_notification(int(data["sent_from"]), new_notification)

            notifications.mark_read_by_type_and_actor(
                recipient_id=user_id,
                actor_id=int(data["sent_from"]),
                type_="friend_request"
            )
        except Exception as e:
            print(f"notification failed, accept still succeeded: {e}   source:{__name__}") #log message
        
        print(f"Successfully sent response    source:{__name__}") #log message
        return jsonify({"message":f"request accepted"}), 200 #frontend response
    
    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()