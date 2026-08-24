#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request

#import user created modules
from modules.chat_modules import conversations

#loading env variables
secret=os.getenv("JWT_SECRET")

#initialzing route name and filepath
chat=Blueprint("conversation_summary", __name__)

#route the conversation_update socket ping tells the client to hit, last message + unread count only
@chat.route("/conversation-summary", methods=["GET"])
def conversation_summary():
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

    try:
        is_participant, _=conversations.get_participant_check(conversation_id, user_id)
        if not is_participant:
            return jsonify({"message": "Unauthorized"}), 401

        summary=conversations.get_conversation_summary(conversation_id, user_id)
        return jsonify({"summary": summary}), 200 #frontend response

    except Exception as e:
        print(f"{e}   source:{__name__}") #log message
        return jsonify({"message": "Server error"}), 500 #frontend response