#import inbuilt modules
import os
from flask import Blueprint, request, jsonify, make_response

#initializing route name and filepath
auth=Blueprint("logout", __name__)

@auth.route("/log-out", methods=["POST"])
def log_out():
    
    try:
        # Response object
        response = make_response(jsonify({
            "message": "Log out successful"
        }))

        # Delete cookie using Flask's built-in function
        response.delete_cookie(
            "logged_in",
            path="/",
            secure=os.getenv("PY_ENV") == "production",
            samesite="None" if os.getenv("PY_ENV") == "production" else "Lax"
        )

        print(f"Successfully signed out user   source: {__name__}") # log message
        return response, 200 # frontend response
        
    except Exception as e:
        print(f"Error: {e}   source: {__name__}") # log message
        return jsonify({"message": "Server error"}), 500 # frontend response