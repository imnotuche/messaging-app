#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request

#import user created modules
from modules.database_modules import database

#initialzing route name and filepath
friend=Blueprint("mutual", __name__)


#route to get mutual friend count between logged-in user and a target user
@friend.route("/get-mutual-friends-count", methods=["GET"])
def get_mutual_friends_count():
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

    target_id = request.args.get("target_id")

    if not target_id:
        print(f"Missing target_id parameter    source:{__name__}") #log message
        return jsonify({"message": "target_id is required"}), 400

    if str(user_id) == str(target_id):
        print(f"user_id and target_id are identical    source:{__name__}") #log message
        return jsonify({"message": "target_id cannot equal the logged-in user"}), 400

    try:
        conn, cursor = database.connect()

        # get mutual count by intersecting both users' friend lists via CASE-aliased friend_id
        cursor.execute(
            """
                SELECT COUNT(*) AS mutual_count
                FROM (
                    SELECT CASE WHEN f.user_1 = ? THEN f.user_2 ELSE f.user_1 END AS friend_id
                    FROM friendships f
                    WHERE (f.user_1 = ? OR f.user_2 = ?) AND f.status = 'friends'
                ) AS friends_a
                JOIN (
                    SELECT CASE WHEN f.user_1 = ? THEN f.user_2 ELSE f.user_1 END AS friend_id
                    FROM friendships f
                    WHERE (f.user_1 = ? OR f.user_2 = ?) AND f.status = 'friends'
                ) AS friends_b
                ON friends_a.friend_id = friends_b.friend_id
            """,
            (user_id, user_id, user_id, target_id, target_id, target_id)
        )
        row = cursor.fetchone()
        mutual_count = row["mutual_count"] if row else 0

        print(f"Successfully retrieved mutual friend count    source:{__name__}") #log message
        return jsonify({"mutual_count": mutual_count}), 200 #frontend response

    except Exception as e:
        print(f"error: {str(e)}    source:{__name__}") #log message
        return jsonify({"message": "Server error fetching mutual friends count"}), 500 #frontend response

    finally:
        if conn:
            conn.close()