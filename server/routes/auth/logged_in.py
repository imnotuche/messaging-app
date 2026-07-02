#import inbuilt modules
from flask import Blueprint, request, jsonify, make_response
import jwt
import os
from dotenv import load_dotenv

#import user created modules
from modules.database_modules import database
from modules.caching import online_user_data

#loading env variables
load_dotenv()
secret=os.getenv("JWT_SECRET")

#initializing route name and filepath
auth=Blueprint("loggedin", __name__)

@auth.route("/logged-in", methods=["GET"])
def logged_in():
    #verify existence of logged_in cookie
    token = request.cookies.get("logged_in")

    conn = None

    if token:
        try:
            payload = jwt.decode(token, secret, algorithms=["HS256"])
        except Exception as e:
            print(f"JWT Decode Error: {e}   source:{__name__}") #log
            response = make_response(jsonify({
                "message": "invalid or expired token",
                "logged_in": False
            }))
            return response, 401
        
        try:
            user_id = payload["user"]["id"]
            
            # fetch user data from redis db
            user = online_user_data.fetch_user_data(user_id)
            
            if not user:
                # use id to fetch data from the db (explicitly include id here)
                conn, cursor = database.connect() 
                cursor.execute(
                    "SELECT id, name, email, username, profile, bio, last_seen FROM users WHERE id = ?",
                    (user_id,)
                )
                row = cursor.fetchone()
                
                # if user doesn't exist
                if not row:
                    print(f"User not found   source:{__name__}") 
                    return jsonify({"message": "Account does not exist"}), 404
                
                # Convert the database row into a clean dictionary
                user = {
                    "user_id": row["id"],  # Maps to data['user_id'] inside your Redis module
                    "name": row["name"],
                    "email": row["email"],
                    "username": row["username"],
                    "profile": row["profile"],
                    "last_seen": row["last_seen"],
                    "bio": row["bio"],
                }
                
                # load into redis
                online_user_data.set_user_data(user)
            
            print(f"logged in   source:{__name__}") #log
            response = make_response(jsonify({
                "message": "valid session",
                "logged_in": True,
                "payload": user
            }))
            return response, 200 #frontend response

        except Exception as e:
            print(f"Database/Cache Error: {e}   source:{__name__}") #log
            return jsonify({"message": "Server error processing user session", "logged_in": False}), 500
        finally:
            if conn:
                conn.close()
    
    else:
        print(f"not logged in   source:{__name__}") #log
        response = make_response(jsonify({"logged_in": False}))
        return response, 401 #frontend response