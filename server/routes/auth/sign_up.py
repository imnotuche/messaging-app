#import inbuilt modules
import os
from flask import Blueprint, request, jsonify, make_response
from passlib.hash import bcrypt
import jwt
from datetime import datetime, timezone, timedelta

#import user created modules
from modules import database

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

    hashed = bcrypt.hash(data["password"]) #encrypt the password
    
    try:

        conn, cursor=database.connect()
        
        #check for existing email
        cursor.execute("SELECT id FROM users WHERE email = ?", (data["email"],))
        if cursor.fetchone():
            print(f"Email already exists  source: {__name__}") #log message
            return jsonify({"message": "An account with this email already exists"}), 400 #frontend response
        
        #check for existing username
        cursor.execute("SELECT id FROM users WHERE username=?", (data["username"],))
        if cursor.fetchone():
            print(f"Username is taken  source: {__name__}") #log message
            return jsonify({"message": f"The username '{data['username']}' is taken"}), 400 #frontend response

        #insert user info
        cursor.execute("INSERT INTO users (name, email, username, password, profile, bio, online) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                data["name"].strip(), 
                data["email"].lower().strip(), 
                data["username"].lower().strip(), 
                hashed, 
                str(os.getenv("DEFAULT_PROFILE")), 
                "",
                0
            )
        )
        conn.commit()

        #get id if the user just saved
        cursor.execute(
            "SELECT id FROM users WHERE email = ? OR username = ?",
            (data["email"].lower().strip(), data["username"].lower().strip())
        )
        id = cursor.fetchone()

        #create jwt
        payload= {
            "user": {
                "id": id
            },
            "exp": datetime.now(timezone.utc)+ timedelta(days=30) #expiry set to 30days
        }
        token=jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")

        #response object
        response=make_response(jsonify({"message": "Sign up successful"}))

        #set cookie
        response.set_cookie(
            "logged_in",           
            token,           
            httponly=True,   
            secure=os.getenv("PY_ENV")=="production",     
            samesite="None" if os.getenv("PY_ENV")=="production" else "Lax", 
            max_age=60*60*24*30,
            path="/" #expires in 30d   
        )

        print(f"successfully added {data.get('name')} to users  source: {__name__}") #log message
        return response, 200 #frontend response
        
    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response

    finally:
        if conn:
            conn.close()


