#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request

#import user created modules
from modules.chat_modules import conversations

#loading env variables
secret=os.getenv("JWT_SECRET")

#initialzing route name and filepath
chat=Blueprint("open_conversation", __name__)

#route to get or create the conversation for a friend, used when the message button on a profile is clicked
@chat.route("/open", methods=["POST"])
def open_conversation():
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

    target_user_id=data.get("target_user_id")
    if not target_user_id:
        return jsonify({"message": "target_user_id required"}), 400

    try:
        conversation_id=conversations.get_or_create_conversation(user_id, target_user_id)
        return jsonify({"conversation_id": conversation_id}), 200 #frontend response

    except Exception as e:
        print(f"{e}   source:{__name__}") #log message
        return jsonify({"message": "Unable to open conversation"}), 500 #frontend response