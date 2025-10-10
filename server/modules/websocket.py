#import module
from flask_socketio import SocketIO

#create socketio object
socketio = SocketIO(cors_allowed_origins="*")

#mounts the server (passed as the argument)
def init_socketio(app):
    socketio.init_app(app)
    return socketio