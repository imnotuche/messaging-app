#import inbuilt modules
import os
import hashlib
import secrets
import jwt
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, make_response
from passlib.hash import bcrypt

#import user created modules
from modules.database_modules import database

#initializing route name and filepath
auth=Blueprint("signup", __name__)

#sign up route
@auth.route("/sign-up", methods=["POST"])
def sign_up():

    data=request.get_json()
    conn=None

    #make sure required fields exists
    required_fields = ["name", "email", "username", "password"]
    for field in required_fields:
        if field not in data or not data[field]:
            print(f"{field} is required   source: {__name__}") #log message
            return jsonify({"message": f"{field} is required "}), 400 #frontend response

    email=data["email"].lower().strip()
    username=data["username"].lower().strip()
    hashed_password = bcrypt.hash(data["password"]) #encrypt the password

    try:

        conn, cursor=database.connect()

        #block if a real account already owns this email
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            print(f"Email already exists  source: {__name__}") #log message
            return jsonify({"message": "An account with this email already exists"}), 400 #frontend response

        #block if a real account already owns this username
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            print(f"Username is taken  source: {__name__}") #log message
            return jsonify({"message": f"The username '{username}' is taken"}), 400 #frontend response

        #if a pending signup already exists for this email, resume it instead of blocking
        cursor.execute("SELECT id, username FROM pending_signups WHERE email = ?", (email,))
        existing_pending=cursor.fetchone()

        if existing_pending:

            #still respect the username uniqueness, in case they changed username on resubmit
            if existing_pending["username"] != username:
                cursor.execute("SELECT id FROM pending_signups WHERE username = ? AND email != ?", (username, email))
                if cursor.fetchone():
                    print(f"Username is taken by another pending signup  source: {__name__}") #log message
                    return jsonify({"message": f"The username '{username}' is currently reserved"}), 400 #frontend response

            #update the row with whatever they just resubmitted, refresh the timestamp
            cursor.execute(
                "UPDATE pending_signups SET name = ?, username = ?, password = ?, last_sent_at = CURRENT_TIMESTAMP WHERE email = ?",
                (data["name"].strip(), username, hashed_password, email)
            )
            conn.commit()

        else:

            #block if a pending signup already owns this username, under a different email
            cursor.execute("SELECT id FROM pending_signups WHERE username = ?", (username,))
            if cursor.fetchone():
                print(f"Pending signup already exists for username  source: {__name__}") #log message
                return jsonify({"message": f"The username '{username}' is currently reserved"}), 400 #frontend response

            #insert the pending signup row
            cursor.execute(
                "INSERT INTO pending_signups (name, email, username, password, last_sent_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
                (data["name"].strip(), email, username, hashed_password)
            )
            conn.commit()

        code = f"{secrets.randbelow(1000000):06d}" #randomly generate 6-digit code
        code_hash = hashlib.sha256(code.encode()).hexdigest() #hash otp, not reversible, cheap on purpose

        subject="Verify Your Andora Account"
        body=f"""

            <p>Dear {data['name'].strip()},</p>

            <h1>{code}</h1>

            <p>The code above verifies your email, do not share with anyone</p>

        """

        #queue the email payload into the database
        cursor.execute(
            "INSERT INTO email_queue (recipient, subject, body) VALUES (?, ?, ?)",
            (email, subject, body)
        )
        conn.commit()

        #signed payload binds the otp hash to the email it belongs to
        payload = {
            "email": email,
            "otp_hash": code_hash,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=10) #expires in 10 minutes
        }
        token=jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")

        #response object
        response=make_response(jsonify({
            "message": f"Verification code sent to {email}"
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

        print(f"queued verification code for pending signup {email}  source: {__name__}") #log message
        return response, 200 #frontend response

    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response

    finally:
        if conn:
            conn.close()