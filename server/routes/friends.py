#import inbuilt modules
from flask import Blueprint, jsonify, request
import json

#import user created modules
from modules import database

#initialzing route name and filepath
friend=Blueprint("friend", __name__)

#route to send friend request
@friend.route("/friend-request", methods=["POST"])
def send_friend_request():
    data=request.get_json()
    conn = None

    #initialize db and create friendship table
    try:
        conn, cursor=database.connect()

        #make sure request hasnt been made
        cursor.execute(
            "SELECT * FROM friendships WHERE user_1 = ? AND user_2 = ? AND status = ?",
            (
                #we store user friendship ids smaller first, then larger
                #so we search for records in that manner
                min(data["user_id"], data["sent_to"]),
                max(data["user_id"], data["sent_to"]),
                "pending"
            )
        )
        existing_record=cursor.fetchone()
        if existing_record:
            print(f"request already exists   source:{__name__}") #log message
            return jsonify({"message":"Friend request already sent"}), 409 #frontend response
        
        #insert data into table
        cursor.execute(
            "INSERT INTO friendships (user_1, user_2, status, last_action, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                (
                    #users inserted in ascending order
                    min(data["user_id"], data["sent_to"]),
                    max(data["user_id"], data["sent_to"]),
                    "pending",
                    int(data["user_id"])
                )
        )
        
        conn.commit()
        print(f"Successfully sent request    source:{__name__}") #log message
        return jsonify({"message":"Sent"}), 200 #frontend response
        
    except Exception as e:
        print(f"{e}      source:{__name__}") #log message
        return jsonify({"message":"Unable to send request"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()

#route to accept friend request
@friend.route("/accept-request", methods=["POST"])
def accept_request():
    data=request.get_json()
    conn=None
    
    try:
        #find and change field value in the db
        conn, cursor=database.connect()
        cursor.execute(
            f"""
                UPDATE friendships
                SET status = ?,
                    last_action = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_1 = ? AND user_2 = ?
            """,
            (
                "friends",
                data["user_id"],
                min(data["user_id"], data["sent_from"]),
                max(data["user_id"], data["sent_from"])
            )
        )
        
        conn.commit()
        
        print(f"Successfully sent response    source:{__name__}") #log message
        return jsonify({"message":f"You and @{data['from_username']} are now friends"}), 200 #frontend response
    
    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()

#route to reject friend request
@friend.route("/reject-request", methods=["POST"])
def reject_request():
    data=request.get_json()
    conn=None
    
    try:
        #find and change field value in the db
        conn, cursor=database.connect()
        cursor.execute(
            """
                UPDATE friendships
                SET status = ?,
                    last_action = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_1 = ? AND user_2 = ?
            """,
            (
                "rejected",
                data["user_id"],
                min(data["user_id"], data["sent_from"]),
                max(data["user_id"], data["sent_from"])
            )
        )
        
        conn.commit()
        
        print(f"Successfully sent response    source:{__name__}") #log message
        return jsonify({"message":f"You rejected @{data['from_username']}'s friend request"}), 200 #frontend response

    except Exception as e:
        print(f"error: {str(e)}  source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()

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

#route to unblock a user          
@friend.route("/unblock-user", methods=["POST"])
def unblock_user():
    data=request.get_json()
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

