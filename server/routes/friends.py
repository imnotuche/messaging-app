#import inbuilt modules
from flask import Blueprint, jsonify, request

#import user created modules
from modules import database

#initialzing route name and filepath
friend=Blueprint("friend", __name__)

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
                    user_1 INTEGER,
                    user_2 INTEGER,
                    status TEXT,
                    last_action INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
        )
        
        #insert data into table
        cursor.execute(
            "INSERT INTO friendships (user_1, user_2, status, last_action) VALUES (?, ?, ?, ?)",
            (
               int( data["from_id"]),
               int( data["to_id"]),
                "pending",
               int(data["from_id"]),
            )
        )
        
        conn.commit()
        print(f"Successfully sent request    source:{__name__}") #log message
        return jsonify({"message":"Successfully sent request"}), 200 #frontend response
        
    except Exception as e:
        print(f"Unable to send request      source:{__name__}") #log message
        return jsonify({"message":"Unable to send request"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()
    
    
    
    


