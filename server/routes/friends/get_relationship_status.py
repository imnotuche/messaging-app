#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request
import json

#import user created modules
from modules.database_modules import database

#initialzing route name and filepath
friend=Blueprint("status", __name__)


#route to get the individual relationship status between two users
@friend.route("/get-relationship-status", methods=["GET"])
def get_relationship_status():
    token = request.cookies.get("logged_in")
    target_user_id = request.args.get("target_id")
    conn = None

    if not token:
        print(f"Missing authorization token    source:{__name__}") #log message
        return jsonify({"message": "Unauthorized session"}), 401
        
    if not target_user_id:
        return jsonify({"message": "Missing target_id parameter"}), 400

    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        user_id = int(payload["user"]["id"])
        target_id = int(target_user_id)
    except Exception as e:
        print(f"Context parsing error: {e}    source:{__name__}") #log message
        return jsonify({"message": "Invalid session or query arguments"}), 401

    try:
        conn, cursor = database.connect()
        
        # Look up records matching your min/max ascending primary sorting strategy
        cursor.execute(
            """
                SELECT status, last_action, blocked 
                FROM friendships 
                WHERE user_1 = ? AND user_2 = ?
            """,
            (min(user_id, target_id), max(user_id, target_id))
        )
        row = cursor.fetchone()

        # If no relationship has ever been initiated between these users, return a clean empty object
        if not row:
            print(f"No relationship record exists    source:{__name__}") #log message
            return jsonify({"status": "none",}), 200 #frontend response

        relationship_details = {
            "status": row["status"],
            "last_action": row["last_action"],
            "blocked_data": json.loads(row["blocked"]) if row["blocked"] else None
        }

        print(f"Successfully retrieved relationship status    source:{__name__}") #log message
        return jsonify(relationship_details), 200 #frontend response

    except Exception as e:
        print(f"error: {str(e)}    source:{__name__}") #log message
        return jsonify({"message": "Server error fetching relationship status"}), 500 #frontend response

    finally:
        if conn:
            conn.close()