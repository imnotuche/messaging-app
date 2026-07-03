#import inbuilt modules
from flask import Blueprint, jsonify, request
import jwt
import os

#import user created modules
from modules.database_modules import database
from modules.caching import online_user_data

#initialzing route name and filepath
user=Blueprint("user", __name__)

# route to search users dynamically using fuzzy matching and smart username detection
@user.route("/search", methods=["GET"])
def search_users():
    
    conn=None
    try:
        # extract search query from parameters
        query=request.args.get("query", "").strip()
        if not query:
            print(f"Empty search query submitted    source: {__name__}") #log message
            return jsonify({"message": "Query parameter is required", "payload": []}), 400 #frontend response
            
        conn, cursor=database.connect()
        
        # detect weather its a username search if it starts with an @
        if query.startswith("@"):
            clean_username = query[1:] # strip the @ symbol out
            search_pattern = f"%{clean_username}%"
            
            cursor.execute(
                """
                    SELECT id, name, email, username, profile, bio, last_seen FROM users
                    WHERE username LIKE ?
                """,
                (search_pattern,)
            )
        else:
            search_pattern = f"%{query}%"
            
            # search across name, username, and email fields
            cursor.execute(
                """
                    SELECT id, name, email, username, profile, bio, last_seen FROM users
                    WHERE name LIKE ? OR username LIKE ? OR email LIKE ?
                """,
                (search_pattern, search_pattern, search_pattern)
            )
            
        rows=cursor.fetchall()
        results=[]
        
        # loop through findings and clean into readable list dictionaries
        for row in rows:
            results.append({
                "user_id": row["id"],
                "name": row["name"],
                "email": row["email"],
                "username": row["username"],
                "profile": row["profile"],
                "bio": row["bio"],
                "last_seen": row["last_seen"],
            })
            
        print(f"Successfully matched {len(results)} items for query '{query}'    source: {__name__}") #log message
        return jsonify({"message": "Success", "payload": results}), 200 #frontend response
            
    except Exception as e:
        print(f"Error: {e}    source: {__name__}") #log message
        return jsonify({"message": "Server error"}), 500 #frontend response
        
    finally:
        if conn:
            conn.close()


# route to update user data implicitly via token context identity
@user.route("/update-data", methods=["PATCH"])
def update_data():
    
    conn=None
    try:
        # extract token value directly out of the secure cookie storage context
        token=request.cookies.get("logged_in")
        if not token:
            print(f"Token is missing    source: {__name__}") #log message
            return jsonify({"message": "Unauthorized access"}), 401 #frontend response
            
        try:
            # decode the target token using systemic signature configuration key strings
            decoded_payload=jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
            
            # This is now our single source of truth for identity!
            id = decoded_payload["user"]["id"] 
            
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as jwt_err:
            print(f"Token parsing identity failure: {jwt_err}    source: {__name__}") #log message
            return jsonify({"message": "Session expired or invalid"}), 401 #frontend response
            
        # extract payload variables from post request data
        request_data=request.get_json()
        if not request_data:
            print(f"No data provided    source: {__name__}") #log message
            return jsonify({"message":"No data provided"}), 400 #frontend response
            
        # fields allowed to be dynamically updated
        allowed_fields=["name", "email", "username", "profile", "bio"]
        
        update_fields=[]
        query_values=[]
        
        # dynamically append field targets for the dynamic update query syntax
        for field in allowed_fields:
            if field in request_data:
                update_fields.append(f"{field} = ?")
                query_values.append(request_data[field])
                
        # prevent empty database submission execution
        if not update_fields:
            print(f"No valid fields to update    source: {__name__}") #log message
            return jsonify({"message":"No valid fields to update"}), 400 #frontend response
            
        conn, cursor=database.connect()

        # --- PRE-FLIGHT UNIQUE CHECKS ---
        # Check if the requested username is already taken by someone else
        if "username" in request_data:
            cursor.execute("SELECT id FROM users WHERE username = ? AND id != ?", (request_data["username"], id))
            if cursor.fetchone():
                print(f"Username is taken    source: {__name__}") #log message
                return jsonify({"message": "Username is already taken"}), 400

        # Check if the requested email is already taken by someone else
        if "email" in request_data:
            cursor.execute("SELECT id FROM users WHERE email = ? AND id != ?", (request_data["email"], id))
            if cursor.fetchone():
                print(f"Email already exists    source: {__name__}") #log message
                return jsonify({"message": "Email is already taken"}), 400
        # --------------------------------

        # append user identification argument value for the WHERE clause
        query_values.append(id)
        
        # update the persistent database schema matching variables
        cursor.execute(
            f"""
                UPDATE users 
                SET {", ".join(update_fields)}
                WHERE id = ?
            """,
            tuple(query_values)
        )
        conn.commit()
        
        # fetch comprehensive structural data to maintain cache synchronization state
        cursor.execute(
            """
                SELECT name, email, username, profile, bio, last_seen FROM users
                WHERE id = ?
            """,
            (id,)
        )
        data_row=cursor.fetchone()
        
        updated_data={
            "user_id": id,
            "name": data_row["name"],
            "email": data_row["email"],
            "username": data_row["username"],
            "profile": data_row["profile"],
            "bio": data_row["bio"],
            "last_seen": data_row["last_seen"],
        }
        
        # load into redis
        online_user_data.set_user_data(updated_data)
        
        print(f"successfully updated {updated_data.get('name')} profile details    source: {__name__}") #log message
        return jsonify({"message":"Succesfully updated data", "payload": updated_data}), 200 #frontend response
            
    except Exception as e:
        print(f"Error: {e}    source: {__name__}") #log message
        return jsonify({"message":"Server error"}), 500 #frontend response
    
    finally:
        if conn:
            conn.close()