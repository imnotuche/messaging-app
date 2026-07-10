#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request
import json

#import user created modules
from modules.database_modules import database

#initialzing route name and filepath
friend=Blueprint("friends", __name__)


#route to fetch all friends for the logged-in user
@friend.route("/get-friends", methods=["GET"])
def get_friends():
    token = request.cookies.get("logged_in")
    conn = None

    if not token:
        print(f"Missing authorization token    source:{__name__}") #log message
        return jsonify({"message": "Unauthorized session"}), 401

    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        user_id = payload["user"]["id"]
    except Exception as e:
        print(f"JWT Decode Error: {e}    source:{__name__}") #log message
        return jsonify({"message": "Invalid token cookie"}), 401

    try:
        conn, cursor = database.connect()
        
        # Select friends layout safely by aliasing u.id to avoid potential row factory key collisions with f.id
        cursor.execute(
            """
                SELECT 
                    u.id AS friend_user_id, u.name, u.email, u.username, u.profile, u.bio, u.last_seen
                FROM friendships f
                JOIN users u ON u.id = CASE WHEN f.user_1 = ? THEN f.user_2 ELSE f.user_1 END
                WHERE (f.user_1 = ? OR f.user_2 = ?) AND f.status = 'friends'
            """,
            (user_id, user_id, user_id)
        )
        rows = cursor.fetchall()

        friends_list = []
        for row in rows:
            friends_list.append({
                "id": row["friend_user_id"],
                "name": row["name"],
                "email": row["email"],
                "username": row["username"],
                "profile": row["profile"],
                "bio": row["bio"],
                "last_seen": row["last_seen"]
            })

        print(f"Successfully retrieved friends list    source:{__name__}") #log message
        return jsonify({"friends": friends_list}), 200 #frontend response

    except Exception as e:
        print(f"error: {str(e)}    source:{__name__}") #log message
        return jsonify({"message": "Server error fetching friends"}), 500 #frontend response

    finally:
        if conn:
            conn.close()
