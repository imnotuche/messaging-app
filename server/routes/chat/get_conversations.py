#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request

#import user created modules
from modules.chat_modules import conversations

#loading env variables
secret=os.getenv("JWT_SECRET")

#initialzing route name and filepath
chat=Blueprint("get_conversations", __name__)

#route to list every conversation the logged in user is part of
@chat.route("/conversations", methods=["GET"])
def get_conversations():
    token=request.cookies.get("logged_in")
    if not token:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        payload=jwt.decode(token, secret, algorithms=["HS256"])
        user_id=payload["user"]["id"]
    except Exception as e:
        print(f"JWT Decode Error: {e}   source:{__name__}") #log
        return jsonify({"message": "Unauthorized"}), 401

    try:
        rows=conversations.get_conversations_for_user(user_id)
        return jsonify({"conversations": rows}), 200 #frontend response

    except Exception as e:
        print(f"{e}   source:{__name__}") #log message
        return jsonify({"message": "Server error"}), 500 #frontend response