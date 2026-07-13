#import inbuilt modules
import os
import hashlib
import jwt
from flask import Blueprint, request, jsonify

#initializing route name and filepath
verification=Blueprint("reset_verify_code", __name__)

#verify code, confirms identity for the reset flow
@verification.route("/reset/verify-code", methods=["POST"])
def verify_code():
    data=request.get_json()
    token=request.cookies.get("reset_verify")

    if not token:
        print(f"reset_verify cookie missing or expired   source:{__name__}") #log message
        return jsonify({"message": "Verification code expired or missing", "verified": False}), 400 #frontend response

    if "code" not in data or not data["code"]:
        print(f"code is required   source:{__name__}") #log message
        return jsonify({"message": "code is required"}), 400 #frontend response

    try:
        payload=jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
    except Exception as e:
        print(f"JWT Decode Error: {e}   source:{__name__}") #log message
        return jsonify({"message": "Verification code expired or invalid", "verified": False}), 400 #frontend response

    submitted_hash=hashlib.sha256(data["code"].encode()).hexdigest()

    if submitted_hash != payload["otp_hash"]:
        print(f"Incorrect code for {payload['email']}   source:{__name__}") #log message
        return jsonify({"message": "Incorrect code", "verified": False}), 401 #frontend response

    print(f"reset code verified for {payload['email']}   source:{__name__}") #log message
    return jsonify({"message": "Code verified successfully", "verified": True}), 200 #frontend response