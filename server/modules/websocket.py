#import inbuilt modules
import os
import jwt
from dotenv import load_dotenv
from flask import request
from flask_socketio import SocketIO, join_room, leave_room, disconnect

#import user created modules
from modules.caching import online_presence_caching

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