import os
from flask import Flask, request
from dotenv import load_dotenv

from routes.auth import sign_up
from routes.auth import log_in

load_dotenv()
production=os.getenv("PY_ENV")=="production"
port=int(os.getenv("PORT"))

app = Flask(__name__)

app.register_blueprint(sign_up.auth)
app.register_blueprint(log_in.auth)

if __name__ == "__main__":
    app.run(debug=True, port=port, host="0.0.0.0")
    print("server running on port ", port)