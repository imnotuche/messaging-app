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
    token=request.cookies.get("logged_in")

    conn = None

    if token:

        try:
            payload=jwt.decode(token, secret, algorithms=["HS256"])
        except Exception as e:
            print(f"{e}   source:{__name__}") #log
            response=make_response(jsonify({
                "message":"invalid or expired token",
                "logged_in": False
            })) #frontend response
            return response, 401
        
        try:
            id = payload["user"]["id"]
            
            #fetch user data from redis db
            user = online_user_data.fetch_user_data(id)
            
            if not user:
                #use id to fetch data from the db
                conn, cursor=database.connect() 
                cursor.execute(
                    "SELECT name, email, username, profile, bio, last_seen  FROM users WHERE id = ?",
                    (id,)
                )
                user = cursor.fetchone()
                
                #if user dosent exist
                if not user:
                    print(f"User not found   source:{__name__}") 
                    return jsonify({"message":"Account does not exist"}), 404
                
                user = {
                    "name" : user["name"],
                    "email" : user["email"],
                    "username" : user["username"],
                    "profile" : user["profile"],
                    "last_seen" : user["last_seen"],
                    "bio": user["bio"],
                }
                
                #load into redis
                online_user_data.set_user_data(user)
            
        except Exception as e:
            print(f"{e}   source:{__name__}") #log
        finally:
            conn.close()

        print(f"logged in   source:{__name__}") #log
        response=make_response(jsonify({
            "message":"valid session",
            "logged_in": True,
            "payload": user
        }))
        return response, 200 #frontend response
    
    else:
        print(f"not logged in   source:{__name__}") #log
        response=make_response(jsonify({"logged_in": False}))
        return response, 401 #frontend response