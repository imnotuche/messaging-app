#import modules
import os
from flask import Blueprint, request, jsonify
from passlib.hash import bcrypt

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

        print(f"successfully signed in {user['name']}  source: {__name__}") #log message
        return jsonify({
            "message":"Log in successful",
            "payload": {
                "name": user["name"],
                "bio": user["bio"],
                "username": user["username"],
                "online": True,
                "profile": user["profile"]
            }
        }) #frontend response
        
    except Exception as e:
        print(f"Error: {e}   source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response
    
    finally:
        conn.close()

        


