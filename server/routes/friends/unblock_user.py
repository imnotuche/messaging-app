#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request
import json

#import user created modules
from modules.database_modules import database

#initialzing route name and filepath
friend=Blueprint("friend", __name__)


#route to unblock a user          
@friend.route("/unblock-user", methods=["POST"])
def unblock_user():
    data=request.args
    conn=None
    
    try:
        conn, cursor=database.connect()
        
        #find status from record in the friendships table
        cursor.execute(
            '''
                SELECT status, blocked FROM friendships 
                WHERE user_1 = ? AND user_2 = ? AND status = ?
            ''',
            (
                min(data["user_id"], data["unblock_user_id"]),
                max(data["user_id"], data["unblock_user_id"]),
                "blocked"
            )
        )
        row=cursor.fetchone()
        
        #if no previous existing relationship
        #clear row and return response
        if not row["blocked"]:
            
            cursor.execute(
                '''
                    DELETE FROM friendships
                    WHERE user_1 = ? AND user_2 = ?
                ''',
                (
                    min(data["user_id"], data["unblock_user_id"]),
                    max(data["user_id"], data["unblock_user_id"])
                )
            )

        else:
            previous=json.loads(row["blocked"])
            #update record in the friendship table
            cursor.execute(
                '''
                    UPDATE friendships
                    SET status = ?,
                        last_action = ?,
                        blocked = NULL,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_1 = ? AND user_2 = ?
                ''',
                (
                    previous["previous_status"],
                    previous["previous_last_action"],
                    min(data["user_id"], data["unblock_user_id"]),
                    max(data["user_id"], data["unblock_user_id"])
                )
            )
        conn.commit()
        
        print(f"Successfully unblocked user    source:{__name__}") #log message
        return jsonify({"message":f"You unblocked @{data['unblocked_username']}"}), 200 #frontend response
        
    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()
