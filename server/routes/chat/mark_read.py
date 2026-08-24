#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request

#import user created modules
from modules.chat_modules import conversations
from modules import websocket

#loading env variables
secret=os.getenv("JWT_SECRET")

#initialzing route name and filepath
chat=Blueprint("mark_read", __name__)

#route to mark every unread message in a conversation as read, fired when the chat screen opens
@chat.route("/mark-read", methods=["POST"])
def mark_read():
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

        updated_ids=conversations.mark_read(conversation_id, user_id)

        #wrapped separately so a socket hiccup never rolls back the read state that was already saved
        try:
            if updated_ids:
                websocket.emit_message_read(conversation_id, updated_ids, user_id)
        except Exception as e:
            print(f"read emit failed, read state still saved: {e}   source:{__name__}") #log message

        print(f"marked {len(updated_ids)} messages read, conversation {conversation_id}   source:{__name__}") #log message
        return jsonify({"message": "ok", "updated_ids": updated_ids}), 200 #frontend response

    except Exception as e:
        print(f"{e}   source:{__name__}") #log message
        return jsonify({"message": "Server error"}), 500 #frontend response