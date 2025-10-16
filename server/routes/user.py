#import inbuilt modules
from flask import Blueprint, jsonify, request

#import user created modules
from modules.database_modules import database
from modules.caching import online_user_data

#initialzing route name and filepath
user=Blueprint("user", __name__)

#route to fetch user data by id
@user.route("/fetch-data/<id>", methods=["GET"])
def fetch_data(id):
    
    conn=None
    try:
        #fetch data from redis db
        data=online_user_data.fetch_user_data(id)
        
        #fetch from db and load into redis if not found
        if not data:
            conn, cursor=database.connect()
            cursor.execute(
                """
                    SELECT name, email, username, profile, bio FROM users
                    WHERE id = ?
                """,
                (id,)
            )
            data_row=cursor.fetchone()
            
            if not data_row:
                return jsonify({"message":"User does not exist"}), 404
            
            data={
                "user_id": id,
                "name": data_row["name"],
                "email": data_row["email"],
                "username": data_row["username"],
                "profile": data_row["profile"],
                "bio": data_row["bio"]
            }
            
            #load into redis
            online_user_data.set_user_data(data)
            
        return jsonify({"message":"Success", "payload": data}), 200 #frontend response
            
    except Exception as e:
        print(f"Error: {e}    source: {__name__}") #log
        return jsonify({"message":"Server error"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()