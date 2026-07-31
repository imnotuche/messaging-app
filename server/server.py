#monkey patch must run before any other imports touch sockets/threading, eventlet requires this
import eventlet
eventlet.monkey_patch()

#import modules
import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect
from dotenv import load_dotenv
import threading

#load env variables
load_dotenv()
production=os.getenv("PY_ENV")=="production"
port=int(os.getenv("PORT"))

#import user created files
from modules.database_modules import create_tables
from modules.async_workers import pending_signups_cleaner
from modules.async_workers import email_worker
from modules import websocket

#import routes
from routes.auth import sign_up
from routes.auth import log_in
from routes.auth import log_out
from routes.auth import logged_in
from routes.auth.signup_verification import resend_code
from routes.auth.signup_verification import verify_code
from routes.auth.signup_verification import verify_status
from routes.auth.reset_password import verify_reset_code
from routes.auth.reset_password import send_reset_code
from routes.auth.reset_password import reset_password
from routes.friends import send_request
from routes.friends import accept_request
from routes.friends import cancel_request
from routes.friends import block_user
from routes.friends import unblock_user
from routes.friends import unfriend_user
from routes.friends import get_friends
from routes.friends import search_friends
from routes.friends import get_relationship_status
from routes.friends import get_mutual_friends
from routes import user
from routes import notifications

app = Flask(__name__)

#to allow cross site access
CORS(
    app, 
    supports_credentials=True, 
    origins=[
        "null", "http://127.0.0.1:5500", "http://localhost:5500", 
        "http://localhost:5173", "http://10.52.45.134:5173",
        "http://localhost:4173"
    ]
)

#initialize socket
socketio = websocket.init_socketio(app)

if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
    pending_signups_cleaner.start_pending_signups_cleanup_scheduler()

#create necessary tables
create_tables.create_tables()

if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
        worker_thread = threading.Thread(target=email_worker.process_email_queue, daemon=True)
        worker_thread.start()
        print("Backend engine automatically spawned the email worker thread.")

#mount imported routes
app.register_blueprint(sign_up.auth, url_prefix="/auth")
app.register_blueprint(log_in.auth, url_prefix="/auth")
app.register_blueprint(log_out.auth, url_prefix="/auth")
app.register_blueprint(logged_in.auth, url_prefix="/auth")
app.register_blueprint(resend_code.signup_verification, url_prefix="/auth")
app.register_blueprint(verify_code.signup_verification, url_prefix="/auth")
app.register_blueprint(verify_status.signup_verification, url_prefix="/auth")
app.register_blueprint(verify_reset_code.verification, url_prefix="/auth")
app.register_blueprint(reset_password.verification, url_prefix="/auth")
app.register_blueprint(send_reset_code.verification, url_prefix="/auth")
app.register_blueprint(send_request.friend, url_prefix="/friends")
app.register_blueprint(accept_request.friend, url_prefix="/friends")
app.register_blueprint(cancel_request.friend, url_prefix="/friends")
app.register_blueprint(block_user.friend, url_prefix="/friends")
app.register_blueprint(unblock_user.friend, url_prefix="/friends")
app.register_blueprint(unfriend_user.friend, url_prefix="/friends")
app.register_blueprint(get_friends.friend, url_prefix="/friends")
app.register_blueprint(search_friends.friend, url_prefix="/friends")
app.register_blueprint(get_relationship_status.friend, url_prefix="/friends")
app.register_blueprint(get_mutual_friends.friend, url_prefix="/friends")
app.register_blueprint(user.user, url_prefix="/user")
app.register_blueprint(notifications.notification, url_prefix="")


#start server
if __name__ == "__main__":
    print("server running on port ", port)
    socketio.run(app, debug=True, port=port, host="0.0.0.0")