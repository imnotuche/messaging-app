#import inbuilt modules
import os
import jwt
from flask import Blueprint, request, jsonify

#initializing route name and filepath
signup_verification=Blueprint("verify_status", __name__)

#check if a valid signup verification is currently pending
@signup_verification.route("/signup/verify-status", methods=["GET"])
def verify_status():
    token=request.cookies.get("signup_verify")

    if not token:
        return jsonify({"pending": False}), 200 #frontend response

    try:
        payload=jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
    except Exception as e:
        print(f"JWT Decode Error: {e}  source: {__name__}") #log message
        return jsonify({"pending": False}), 200 #frontend response

    print(f"active signup verification found for {payload['email']}  source: {__name__}") #log message
    return jsonify({"pending": True, "email": payload["email"]}), 200 #frontend response