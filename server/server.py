#import modules
import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect
from dotenv import load_dotenv
import threading

#import user created files
from modules.database_modules import create_tables
from modules.async_workers import email_worker
from modules.caching import redis_notifications
from modules import websocket

#import routes
from routes.auth import sign_up
from routes.auth import log_in
from routes.auth import log_out
from routes.auth import verify_email
from routes.auth import logged_in
from routes.friends import send_request
from routes.friends import accept_request
from routes.friends import reject_request
from routes.friends import block_user
from routes.friends import unblock_user
from routes.friends import get_friends
from routes.friends import get_relationship_status
from routes.caching import user_presence_caching
from routes import user

#load env variables
load_dotenv()
production=os.getenv("PY_ENV")=="production"
port=int(os.getenv("PORT"))

app = Flask(__name__)

#to allow cross site access
CORS(
    app, 
    supports_credentials=True, 
    origins=["null", "http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:5173"]
)

#initialize socket
socketio = websocket.init_socketio(app)

#logs to confirm connection
@socketio.on('connect')
def handle_connect():
    print('Client connected')

#logs to confirm disconnect
@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

#create necessary tables
create_tables.create_tables()

#run thread to handle redis key expiry to track online users
t = threading.Thread(
    target=redis_notifications.listen_for_expired_keys,
    args=(int(os.getenv("ONLINE_USER_DB")), socketio),
    daemon=True 
)
t.start()

if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
        worker_thread = threading.Thread(target=email_worker.process_email_queue, daemon=True)
        worker_thread.start()
        print("Backend engine automatically spawned the email worker thread.")

#mount imported routes
app.register_blueprint(sign_up.auth, url_prefix="/auth")
app.register_blueprint(log_in.auth, url_prefix="/auth")
app.register_blueprint(log_out.auth, url_prefix="/auth")
app.register_blueprint(verify_email.verification, url_prefix="/auth")
app.register_blueprint(logged_in.auth, url_prefix="/auth")
app.register_blueprint(send_request.friend, url_prefix="/friends")
app.register_blueprint(accept_request.friend, url_prefix="/friends")
app.register_blueprint(block_user.friend, url_prefix="/friends")
app.register_blueprint(unblock_user.friend, url_prefix="/friends")
app.register_blueprint(get_friends.friend, url_prefix="/friends")
app.register_blueprint(get_relationship_status.friend, url_prefix="/friends")
app.register_blueprint(user_presence_caching.cache, url_prefix="/cache")
app.register_blueprint(user.user, url_prefix="/user")

#start server
if __name__ == "__main__":
    socketio.run(app, debug=True, port=port, host="0.0.0.0")
    print("server running on port ", port)