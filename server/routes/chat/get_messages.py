#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request

#import user created modules
from modules.chat_modules import conversations

#loading env variables
secret=os.getenv("JWT_SECRET")

#initialzing route name and filepath
chat=Blueprint("get_messages", __name__)

#route for the last N messages, or older ones when before_id is passed for scroll up
@chat.route("/messages", methods=["GET"])
def get_messages():
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

    conversation_id=data.get("conversation_id")
    if not conversation_id:
        return jsonify({"message": "conversation_id required"}), 400

    before_id=data.get("before_id")
    limit=int(data.get("limit", 100))

    try:
        is_participant, _=conversations.get_participant_check(conversation_id, user_id)
        if not is_participant:
            return jsonify({"message": "Unauthorized"}), 401

        rows=conversations.get_messages(conversation_id, before_id, limit)

        #fetching them via rest means they reached this device, mark delivered as a fallback for the offline case
        try:
            conversations.mark_delivered_for_conversation(conversation_id, user_id)
        except Exception as e:
            print(f"delivery mark failed, messages still returned: {e}   source:{__name__}") #log message

        return jsonify({"messages": rows}), 200 #frontend response

    except Exception as e:
        print(f"{e}   source:{__name__}") #log message
        return jsonify({"message": "Server error"}), 500 #frontend response