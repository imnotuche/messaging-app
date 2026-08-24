#import inbuilt modules
import os
import jwt
from dotenv import load_dotenv
from flask import request
from flask_socketio import SocketIO, join_room, leave_room, disconnect

#import user created modules
from modules.caching import online_presence_caching
from modules.chat_modules import conversations

#loading env variables
load_dotenv()
secret=os.getenv("JWT_SECRET")

#create socketio object, explicit origins, not wildcard, because we need credentials
socketio = SocketIO(
    cors_allowed_origins=[
        "http://127.0.0.1:5500", "http://localhost:5500", 
        "http://localhost:5173", "http://10.52.45.134:5173" ,
        "http://localhost:4173"
    ],
    cors_credentials=True,
    logger=True,
    engineio_logger=True
)

#in memory map of sid to user_id, one entry per open tab/device, cleared on disconnect
connected_users = {}

#in memory map of sid to conversation_id, tracks who is mid typing so we can clean up on a dropped connection
typing_status = {}

#mounts the server (passed as the argument)
def init_socketio(app):
    socketio.init_app(app)
    return socketio

#guards the connection, rejects anyone without a valid jwt cookie
@socketio.on('connect')
def handle_connect():
    token = request.cookies.get("logged_in")

    if not token:
        print(f"connection rejected, no token   source:{__name__}") #log
        disconnect()
        return False

    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        user_id = payload["user"]["id"]
    except Exception as e:
        print(f"JWT Decode Error: {e}   source:{__name__}") #log
        disconnect()
        return False

    try:
        was_online = online_presence_caching.check_online_status(user_id)
        connected_users[request.sid] = user_id
        online_presence_caching.add_connection(user_id, request.sid)
    except Exception as e:
        print(f"{e}   source:{__name__}") #log
        disconnect()
        return False

    #every socket a user opens joins their own notification room automatically, no explicit subscribe needed
    join_room(f"notifications:{user_id}")

    #same deal for chat, list screen updates land here regardless of which conversation (if any) is open
    join_room(f"chat_inbox:{user_id}")

    #only broadcast if this is the first active tab, not every duplicate connection
    if not was_online:
        socketio.emit("presence_change", {"user_id": user_id, "status": "online"}, room=f"presence:{user_id}")

    print(f"user {user_id} connected, sid {request.sid}   source:{__name__}") #log

#cleans up on disconnect, only goes offline once every tab/device has dropped
@socketio.on('disconnect')
def handle_disconnect():
    user_id = connected_users.pop(request.sid, None)

    if user_id:
        remaining = online_presence_caching.remove_connection(user_id, request.sid)

        if remaining == 0:
            socketio.emit("presence_change", {"user_id": user_id, "status": "offline"}, room=f"presence:{user_id}")

        #if they were mid typing when they dropped, dont leave the bubble stuck on the other end
        conversation_id = typing_status.pop(request.sid, None)
        if conversation_id:
            socketio.emit("typing_stop", {"user_id": user_id}, room=f"conversation:{conversation_id}")

        print(f"user {user_id} disconnected, sid {request.sid}, remaining {remaining}   source:{__name__}") #log

#client sends this on a 10s interval to keep the redis ttl alive as a fallback
@socketio.on('heartbeat')
def handle_heartbeat():
    user_id = connected_users.get(request.sid)

    if user_id:
        online_presence_caching.refresh_connection(user_id)

#lets a client join a room to watch a specific user's presence
@socketio.on('subscribe_presence')
def handle_subscribe(data):
    target_id = data.get("target_user_id")

    if not target_id:
        return

    join_room(f"presence:{target_id}")

    #send current status immediately, dont make the ui wait for the next change
    status = "online" if online_presence_caching.check_online_status(target_id) else "offline"
    socketio.emit("presence_change", {"user_id": target_id, "status": status}, room=request.sid)

#lets a client leave a presence room
@socketio.on('unsubscribe_presence')
def handle_unsubscribe(data):
    target_id = data.get("target_user_id")

    if not target_id:
        return

    leave_room(f"presence:{target_id}")

#exported for route files to call after creating a notification
def emit_notification(user_id, notification):
    socketio.emit("new_notification", notification, room=f"notifications:{user_id}")

#client joins this when the chat screen for a specific conversation is open, drives live message/typing/tick updates
@socketio.on('join_conversation')
def handle_join_conversation(data):
    conversation_id = data.get("conversation_id")

    if not conversation_id:
        return

    join_room(f"conversation:{conversation_id}")

#client leaves when the chat screen closes, stops receiving live updates for that convo
@socketio.on('leave_conversation')
def handle_leave_conversation(data):
    conversation_id = data.get("conversation_id")

    if not conversation_id:
        return

    leave_room(f"conversation:{conversation_id}")

#canonical write path for a new message, rest stays read only for chat
@socketio.on('send_message')
def handle_send_message(data):
    sender_id = connected_users.get(request.sid)

    if not sender_id:
        disconnect()
        return

    target_user_id = data.get("target_user_id")
    message = data.get("message")
    client_id = data.get("client_id")

    if not target_user_id or not message or not client_id:
        return

    try:
        conversation_id = conversations.get_or_create_conversation(sender_id, target_user_id)
    except Exception as e:
        print(f"{e}   source:{__name__}") #log
        socketio.emit("message_failed", {"client_id": client_id, "reason": "not friends or blocked"}, room=request.sid)
        return

    try:
        new_message = conversations.create_message(conversation_id, sender_id, target_user_id, message, client_id)
    except Exception as e:
        print(f"{e}   source:{__name__}") #log
        socketio.emit("message_failed", {"client_id": client_id, "reason": "send failed"}, room=request.sid)
        return

    #push the full message to anyone with this chat screen open right now, either side
    socketio.emit("new_message", new_message, room=f"conversation:{conversation_id}")

    #ack back to the sender only, so they can reconcile their optimistic indexeddb row against the real id
    socketio.emit("message_sent", {"client_id": client_id, "message": new_message}, room=request.sid)

    #nudge both sides conversation list in case this convo isnt open on some device
    socketio.emit("conversation_update", {"conversation_id": conversation_id}, room=f"chat_inbox:{target_user_id}")
    socketio.emit("conversation_update", {"conversation_id": conversation_id}, room=f"chat_inbox:{sender_id}")

    print(f"message sent, conversation {conversation_id}, sender {sender_id}   source:{__name__}") #log

#client acks a message it actually received live, flips is_received
@socketio.on('message_delivered')
def handle_message_delivered(data):
    message_id = data.get("message_id")
    conversation_id = data.get("conversation_id")

    if not message_id or not conversation_id:
        return

    try:
        conversations.mark_delivered(message_id)
    except Exception as e:
        print(f"{e}   source:{__name__}") #log
        return

    socketio.emit("message_status", {"message_id": message_id, "status": "received"}, room=f"conversation:{conversation_id}")

#debounced on the client, fires once per burst of typing
@socketio.on('typing_start')
def handle_typing_start(data):
    user_id = connected_users.get(request.sid)
    conversation_id = data.get("conversation_id")

    if not user_id or not conversation_id:
        return

    typing_status[request.sid] = conversation_id
    socketio.emit("typing_start", {"user_id": user_id}, room=f"conversation:{conversation_id}", skip_sid=request.sid)

#fires 2s after the last keystroke, or immediately on disconnect via the handler above
@socketio.on('typing_stop')
def handle_typing_stop(data):
    user_id = connected_users.get(request.sid)
    conversation_id = data.get("conversation_id")

    if not user_id or not conversation_id:
        return

    typing_status.pop(request.sid, None)
    socketio.emit("typing_stop", {"user_id": user_id}, room=f"conversation:{conversation_id}", skip_sid=request.sid)

#exported for the mark-read route to call after flipping read flags in the db
def emit_message_read(conversation_id, message_ids, reader_id):
    socketio.emit("message_read", {"message_ids": message_ids, "reader_id": reader_id}, room=f"conversation:{conversation_id}")