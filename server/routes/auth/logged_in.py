#import inbuilt modules
from flask import Blueprint, request, jsonify, make_response
import jwt
import os
from dotenv import load_dotenv

#loading env variables
load_dotenv()
secret=os.getenv("JWT_SECRET")

#initializing route name and filepath
auth=Blueprint("loggedin", __name__)

@auth.route("/logged-in", methods=["GET"])
def logged_in():
    #verify existence of logged_in cookie
    token=request.cookies.get("logged_in")

    if token:

        try:
            payload=jwt.decode(token, secret, algorithms=["HS256"])
        except Exception as e:
            print(f"e   source:{__name__}") #log
            response=make_response(jsonify({
                "message":"invalid or expired token",
                "logged_in": False
            })) #frontend response
            return response, 401

        print(f"logged in   source:{__name__}") #log
        response=make_response(jsonify({
            "message":"valid session",
            "logged_in": True,
            "payload": payload
        }))
        return response, 200 #frontend response
    
    else:
        print(f"not logged in   source:{__name__}") #log
        response=make_response(jsonify({"logged_in": False}))
        return response, 401 #frontend response

