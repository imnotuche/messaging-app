#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request
import json

#import user created modules
from modules.database_modules import database

#initialzing route name and filepath
friend=Blueprint("friend", __name__)


#route to block users 
@friend.route("/block-user", methods=["POST"])
def block_user():
    data=request.get_json()
    conn=None
    
    try:
        conn, cursor=database.connect()
        
        #check if data exists in friendship table
        cursor.execute(
            "SELECT * FROM friendships WHERE user_1 = ? AND user_2 = ?",
            (
                min(data["user_id"], data["block_user_id"]),
                max(data["user_id"], data["block_user_id"]),
            )
        )
        
        friendship=cursor.fetchone()
        
        if friendship:
            
            #state of the friendship before blocking
            blocked = {
                "previous_status": friendship["status"],
                "previous_last_action": friendship["last_action"],
            }
            
            cursor.execute(
                """
                    UPDATE friendships 
                        SET status = ?,
                        blocked = ?,
                        last_action = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_1 = ? AND user_2 = ?
                """,
                (
                    "blocked",
                    #we store previous state of the relationship for unblocking purposes
                    json.dumps(blocked), 
                    data["user_id"],
                    min(data["user_id"], data["block_user_id"]),
                    max(data["user_id"], data["block_user_id"])
                )
            )
            
        else:
            cursor.execute(
                "INSERT INTO friendships (user_1, user_2, status, last_action, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                    (
                        min(data["user_id"], data["block_user_id"]),
                        max(data["user_id"], data["block_user_id"]),
                        "blocked", 
                        data["user_id"],
                    )
            )
            
        conn.commit()
        print(f"Successfully blocked user    source:{__name__}") #log message
        return jsonify({"message":f"You blocked @{data['blocked_username']}"}), 200 #frontend response
    
    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()