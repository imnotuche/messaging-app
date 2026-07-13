import os
import hashlib
import secrets
import jwt
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, make_response

#import user created modules
from modules.database_modules import database


#initializing route name and filepath
signup_verification=Blueprint("resend_code", __name__)

#resend verification code for a pending signup
@signup_verification.route("/signup/resend-code", methods=["POST"])
def resend_code():
    data=request.get_json()
    conn=None

    if "email" not in data or not data["email"]:
        print(f"email is required   source: {__name__}") #log message
        return jsonify({"message": "email is required"}), 400 #frontend response

    email=data["email"].lower().strip()

    try:
        conn, cursor=database.connect()

        #confirm a pending signup exists for this email
        cursor.execute("SELECT id FROM pending_signups WHERE email = ?", (email,))
        pending=cursor.fetchone()

        if not pending:
            print(f"No pending signup found for {email}  source: {__name__}") #log message
            return jsonify({"message": "No pending signup found for this email"}), 404 #frontend response

        #bump last_sent_at so the row's staleness tracks the newest code, not the original signup
        cursor.execute("UPDATE pending_signups SET last_sent_at = CURRENT_TIMESTAMP WHERE email = ?", (email,))
        conn.commit()

        code = f"{secrets.randbelow(1000000):06d}" #randomly generate 6-digit code
        code_hash = hashlib.sha256(code.encode()).hexdigest() #hash otp, not reversible, cheap on purpose

        subject="Verify Your Andora Account"
        body=f"""

            <h1>{code}</h1>

            <p>The code above verifies your email, do not share with anyone</p>

        """

        #queue the email payload into the database
        cursor.execute(
            "INSERT INTO email_queue (recipient, subject, body) VALUES (?, ?, ?)",
            (email, subject, body)
        )
        conn.commit()

        payload = {
            "email": email,
            "otp_hash": code_hash,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=10) #expires in 10 minutes
        }
        token=jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")

        #response object
        response=make_response(jsonify({
            "message": f"Verification code resent to {email}"
        }))

        #set cookie
        response.set_cookie(
            "signup_verify",
            token,
            httponly=True,
            secure=os.getenv("PY_ENV")=="production",
            samesite="None" if os.getenv("PY_ENV")=="production" else "Lax",
            max_age=60*10, #expires in 10 minutes
            path="/"
        )

        print(f"resent verification code for pending signup {email}  source: {__name__}") #log message
        return response, 200 #frontend response

    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response

    finally:
        if conn:
            conn.close()