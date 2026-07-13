#import inbuilt modules
import os
import jwt
from flask import Blueprint, request, jsonify, make_response
from passlib.hash import bcrypt

#import user created modules
from modules.database_modules import database

#initializing route name and filepath
verification=Blueprint("/reset/reset_password", __name__)

#sets a new password for the account bound to the verified reset cookie
@verification.route("/reset/reset-password", methods=["POST"])
def reset_password():
    data=request.get_json()
    conn=None
    token=request.cookies.get("reset_verify")

    if not token:
        print(f"reset_verify cookie missing or expired   source:{__name__}") #log message
        return jsonify({"message": "Verification session expired, please request a new code"}), 400 #frontend response

    if "new_password" not in data or not data["new_password"]:
        print(f"new_password is required   source:{__name__}") #log message
        return jsonify({"message": "new_password is required"}), 400 #frontend response

    try:
        payload=jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
    except Exception as e:
        print(f"JWT Decode Error: {e}   source:{__name__}") #log message
        return jsonify({"message": "Verification session expired, please request a new code"}), 400 #frontend response

    hashed_password=bcrypt.hash(data["new_password"]) #encrypt the new password

    try:
        conn, cursor=database.connect()

        cursor.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            (hashed_password, payload["user_id"])
        )
        conn.commit()

        #response object
        response=make_response(jsonify({
            "message": "Password reset successfully"
        }))

        #clear the reset verification cookie, its job is done
        response.delete_cookie(
            "reset_verify",
            path="/",
            secure=os.getenv("PY_ENV") == "production",
            samesite="None" if os.getenv("PY_ENV") == "production" else "Lax"
        )

        print(f"password reset for user_id {payload['user_id']}   source:{__name__}") #log message
        return response, 200 #frontend response

    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response

    finally:
        if conn:
            conn.close()