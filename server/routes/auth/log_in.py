#import inbuilt modules
import os
from flask import Blueprint, request, jsonify, make_response
from passlib.hash import bcrypt
import jwt
from datetime import datetime, timezone, timedelta

#import user created modules
from modules import database

#initializing route name and filepath
auth=Blueprint("login", __name__)

@auth.route("/log-in", methods=["POST"])
def log_in():
    
    data=request.get_json()

    try:
        #make sure required fields exist
        required_fields = ["email_or_username", "password"]
        for field in required_fields:
            if field not in data or not data[field]:
                print(f"{field} is required   source: {__name__}") #log message
                return jsonify({"message": "Please enter your email or username"}), 400 #frontend response

        conn, cursor=database.connect()    
        #search for existing account
        cursor.execute(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            (data["email_or_username"].lower().strip(), data["email_or_username"].lower().strip())
        )
        user = cursor.fetchone()

        #check if user exists
        if not user: 
            print(f"User not found   source:{__name__}")
            return jsonify({"message":"Account does not exist"}), 404
        
        #check if password matches
        if not bcrypt.verify(data["password"], user["password"]):
            print(f"Incorrect password   source:{__name__}")
            return jsonify({"message":"Incorrect password"}), 401
        
        cursor.execute("UPDATE users SET online = 1 WHERE id = ?", (user["id"],))
        conn.commit()

        #create jwt
        payload= {
            "id": user["id"],
            "exp": datetime.now(timezone.utc)+ timedelta(days=30) #expiry set to 30days
        }
        token=jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")

        #response object
        response=make_response(jsonify({
            "message":"Log in successful",
        }))

        #set cookie
        response.set_cookie(
            "logged_in",           
            token,           
            httponly=True,   
            secure=os.getenv("PY_ENV")=="production",     
            samesite="None" if os.getenv("PY_ENV")=="production" else "Lax", 
            max_age=60*60*24*30 #expires in 30d     
        )

        print(f"successfully signed in {user['name']}  source: {__name__}") #log message
        return  response, 200 #frontend response
        
    except Exception as e:
        print(f"Error: {e}   source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response
    
    finally:
        conn.close()

        


