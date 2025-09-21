#import inbuilt modules
from flask import Blueprint, request, jsonify, make_response
from passlib.hash import bcrypt
import secrets
import os

#import user created modules
from modules import send_email, database

#initializing route name and filepath
verification=Blueprint("verification", __name__)

#send verification email route
@verification.route("/send-code", methods=["POST"])
def send_code():
    data=request.get_json()

    #check if account with email/username exists
    conn, cursor=database.connect()
    cursor.execute(
        "SELECT * FROM users WHERE email=? OR username=?",
        (data["email_or_username"].lower().strip(), data["email_or_username"].lower().strip())
    )
    user=cursor.fetchone()

    if not user:
        print(f"User not found   source:{__name__}")
        return jsonify({"message":"Account does not exist"}), 404

    code = f"{secrets.randbelow(1000000):06d}" #randomly generate 6-digit number

    subject="Reset Your Andora Password"
    body=f"""
    
        <p>Dear {user["name"]},</p>

        <h1>{code}</h1>

        <p>The code above is your verification email, do not share with anyone</p>

    """ 
    #response object
    response=make_response(jsonify({
        "message": f"Verification code has been sent to {user["email"]}"
    }))

    try:
        send_email.send_mail(user["email"], subject, body) #send email

        #encrypt and store code in cookie
        hashed=bcrypt.hash(code) 
        response.set_cookie(
            "verify_email",
            hashed,
            httponly=True,   
            secure=os.getenv("PY_ENV")=="production",     
            samesite="None" if os.getenv("PY_ENV")=="production" else "Lax",
            max_age=60*10 #expires in 10 minutes   
        )

        print(f"Verification code has been sent to {user["email"]}") #log message
        return response, 200 #frontend response

    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Couldn’t send verification email"}), 500 #frontend response

#route to verify code
@verification.route("/verify-code", methods=["POST"])
def verify_code():
    data=request.get_json()
    #access the hashed code stored in cookie
    hashed=request.cookies.get("verify_email")

    if not hashed:
        return jsonify({
            "message": "Verification code expired or missing",
            "verified": False
        }), 400

    if bcrypt.verify(data["code"], hashed):
        return jsonify({
            "message": "Email verified successfully",
            "verified": True
        }), 200
    else:
        return jsonify({
            "message": "Incorrect code",
            "verified": False
        }), 401

    
