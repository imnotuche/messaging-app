#import inbuilt modules
import os
import hashlib
import jwt
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, make_response

#import user created modules
from modules.database_modules import database

#initializing route name and filepath
signup_verification=Blueprint("verify_code", __name__)

#verify code and promote pending signup into users
@signup_verification.route("/signup/verify-code", methods=["POST"])
def verify_code():
    data=request.get_json()
    conn=None
    token=request.cookies.get("signup_verify")

    if not token:
        print(f"signup_verify cookie missing or expired  source: {__name__}") #log message
        return jsonify({"message": "Verification code expired or missing", "verified": False}), 400 #frontend response

    if "code" not in data or not data["code"]:
        print(f"code is required   source: {__name__}") #log message
        return jsonify({"message": "code is required"}), 400 #frontend response

    try:
        payload=jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
    except Exception as e:
        print(f"JWT Decode Error: {e}  source: {__name__}") #log message
        return jsonify({"message": "Verification code expired or invalid", "verified": False}), 400 #frontend response

    email=payload["email"]
    submitted_hash=hashlib.sha256(data["code"].encode()).hexdigest()

    if submitted_hash != payload["otp_hash"]:
        print(f"Incorrect code for {email}  source: {__name__}") #log message
        return jsonify({"message": "Incorrect code", "verified": False}), 401 #frontend response

    try:
        conn, cursor=database.connect()

        #pull the pending row this code belongs to
        cursor.execute("SELECT * FROM pending_signups WHERE email = ?", (email,))
        pending=cursor.fetchone()

        if not pending:
            print(f"Pending signup missing for verified email {email}  source: {__name__}") #log message
            return jsonify({"message": "Signup request no longer exists, please sign up again", "verified": False}), 404 #frontend response

        #promote into users and clear the pending row in one commit, no partial state on failure
        cursor.execute(
            "INSERT INTO users (name, email, username, password, profile, bio, last_seen) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
            (pending["name"], pending["email"], pending["username"], pending["password"], str(os.getenv("DEFAULT_PROFILE")), "")
        )
        cursor.execute("DELETE FROM pending_signups WHERE email = ?", (email,))
        conn.commit()

        #fetch the freshly created user row
        cursor.execute(
            "SELECT id, name, email, username, profile, bio, last_seen FROM users WHERE email = ?",
            (email,)
        )
        user=cursor.fetchone()

        #create session jwt
        session_payload = {
            "user": {
                "id": user["id"]
            },
            "exp": datetime.now(timezone.utc) + timedelta(days=30) #expiry set to 30days
        }
        session_token=jwt.encode(session_payload, os.getenv("JWT_SECRET"), algorithm="HS256")

        #response object
        response=make_response(jsonify({
            "message": "Email verified successfully",
            "verified": True,
            "user": {
                "user_id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "username": user["username"],
                "profile": user["profile"],
                "last_seen": user["last_seen"],
                "bio": user["bio"],
            }
        }))

        #clear the signup verification cookie, no longer needed
        response.delete_cookie(
            "signup_verify",
            path="/",
            secure=os.getenv("PY_ENV") == "production",
            samesite="None" if os.getenv("PY_ENV") == "production" else "Lax"
        )

        #log the user in immediately, matches your existing sign-up behavior
        response.set_cookie(
            "logged_in",
            session_token,
            httponly=True,
            secure=os.getenv("PY_ENV")=="production",
            samesite="None" if os.getenv("PY_ENV")=="production" else "Lax",
            max_age=60*60*24*30, #expires in 30d
            path="/"
        )

        print(f"promoted pending signup {email} into users  source: {__name__}") #log message
        return response, 200 #frontend response

    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response

    finally:
        if conn:
            conn.close()
