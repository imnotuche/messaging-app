#import inbuilt modules
from flask import Blueprint, jsonify, request

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
        cursor.execute(
            """
                CREATE TABLE IF NOT EXISTS friendships(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    from_id INTEGER,
                    to_id INTEGER,
                    status TEXT,
                    last_action INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
        )
        
        #make sure request hasnt been made
        cursor.execute(
            "SELECT * FROM friendships WHERE from_id = ? AND to_id = ? AND status = ?",
            (
                int(data["from_id"]),
                int(data["to_id"]),
                "pending"
            )
        )
        if cursor.fetchone():
            print(f"request already exists   source:{__name__}") #log message
            return jsonify({"message":"Friend request already sent"}), 409 #frontend response
        
        #insert data into table
        cursor.execute(
            "INSERT INTO friendships (from_id, to_id, status, last_action, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                (
                    int(data["from_id"]),
                    int(data["to_id"]),
                    "pending",
                    int(data["from_id"])
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
                WHERE from_id = ? and to_id= ?
            """,
            (
                "friends",
                int(data["user_id"]),
                int(data["from_id"]),
                int(data["user_id"])
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
            f"""
                UPDATE friendships
                SET status = ?,
                    last_action = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE from_id = ? and to_id= ?
            """,
            (
                "rejected",
                int(data["user_id"]),
                int(data["from_id"]),
                int(data["user_id"])
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
    
    
    
    
    

