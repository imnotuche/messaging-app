import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

#import routes
from routes.auth import sign_up
from routes.auth import log_in
from routes.auth import verify_email
from routes.auth import logged_in
from routes import friends

#load env variables
load_dotenv()
production=os.getenv("PY_ENV")=="production"
port=int(os.getenv("PORT"))

app = Flask(__name__)

#to allow cross site access
CORS(
    app, 
    supports_credentials=True, 
    origins=["null", "http://127.0.0.1:5500", "http://localhost:5500"]
)

#mount imported routes
app.register_blueprint(sign_up.auth)
app.register_blueprint(log_in.auth)
app.register_blueprint(verify_email.verification)
app.register_blueprint(logged_in.auth)
app.register_blueprint(friends.friend)

#start server
if __name__ == "__main__":
    app.run(debug=True, port=port, host="0.0.0.0")
    print("server running on port ", port)