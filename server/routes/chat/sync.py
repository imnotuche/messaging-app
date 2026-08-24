#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request

#import user created modules
from modules.chat_modules import conversations

#loading env variables
secret=os.getenv("JWT_SECRET")

#initialzing route name and filepath
chat=Blueprint("sync", __name__)

#route the client hits on every socket reconnect (and on 'online' as a backup), catches up on anything missed while offline
@chat.route("/sync", methods=["GET"])
def sync():
    data=request.args

    token=request.cookies.get("logged_in")
    if not token:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        payload=jwt.decode(token, secret, algorithms=["HS256"])
        user_id=payload["user"]["id"]
    except Exception as e:
        print(f"JWT Decode Error: {e}   source:{__name__}") #log
        return jsonify({"message": "Unauthorized"}), 401

    since=data.get("since")
    if not since:
        return jsonify({"message": "since required"}), 400

    try:
        sync_data=conversations.get_sync_data(user_id, since)

        #fetching new messages via sync means they reached this device, mark delivered as a fallback
        try:
            conversations.mark_delivered_since(user_id, since)
        except Exception as e:
            print(f"delivery mark failed, sync still returned: {e}   source:{__name__}") #log message

        return jsonify(sync_data), 200 #frontend response

    except Exception as e:
        print(f"{e}   source:{__name__}") #log message
        return jsonify({"message": "Server error"}), 500 #frontend response