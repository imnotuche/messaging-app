#import inbuilt modules
import os
import hashlib
import secrets
import jwt
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, make_response

#import user created modules
from modules.database_modules import database

#initializing route name and filepath
verification=Blueprint("reset_send", __name__)

#send verification email route
@verification.route("/reset/send-code", methods=["POST"])
def send_code():
    data=request.get_json()
    conn=None

    if "email_or_username" not in data or not data["email_or_username"]:
        print(f"email_or_username is required   source:{__name__}") #log message
        return jsonify({"message": "email_or_username is required"}), 400 #frontend response

    identifier=data["email_or_username"].lower().strip()

    #allow @username style input, strip leading @ before lookup
    if identifier.startswith("@"):
        identifier=identifier[1:]

    try:
        conn, cursor=database.connect()

        #check if account with email/username exists
        cursor.execute(
            "SELECT id, name, email FROM users WHERE email = ? OR username = ?",
            (identifier, identifier)
        )
        user=cursor.fetchone()

        if not user:
            print(f"User not found   source:{__name__}") #log message
            return jsonify({"message":"Account does not exist"}), 404 #frontend response

        code = f"{secrets.randbelow(1000000):06d}" #randomly generate 6-digit code
        code_hash = hashlib.sha256(code.encode()).hexdigest() #hash otp, not reversible, cheap on purpose

        subject="Reset Your Andora Password"
        body=f"""

            <p>Dear {user['name']},</p>

            <h1>{code}</h1>

            <p>The code above is your verification code, do not share with anyone</p>

        """

        #queue the email payload into the database
        cursor.execute(
            "INSERT INTO email_queue (recipient, subject, body) VALUES (?, ?, ?)",
            (user["email"], subject, body)
        )
        conn.commit()

        #signed payload binds the otp hash to the exact account it belongs to
        payload = {
            "user_id": user["id"],
            "email": user["email"],
            "otp_hash": code_hash,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=10) #expires in 10 minutes
        }
        token=jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")

        #response object
        response=make_response(jsonify({
            "message": f"Verification code has been sent to {user['email']}",
            "email": user["email"]
        }))

        #set cookie
        response.set_cookie(
            "reset_verify",
            token,
            httponly=True,
            secure=os.getenv("PY_ENV")=="production",
            samesite="None" if os.getenv("PY_ENV")=="production" else "Lax",
            max_age=60*10, #expires in 10 minutes
            path="/"
        )

        print(f"queued reset verification code for {user['email']}   source:{__name__}") #log message
        return response, 200 #frontend response

    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response

    finally:
        if conn:
            conn.close()