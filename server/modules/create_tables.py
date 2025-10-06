#import user defined modules
from modules import database

def create_tables():
    #create all tables
    conn=None
    try:
        conn, cursor=database.connect()
        
        #user table
        cursor.execute(
            '''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT UNIQUE,
                    username TEXT UNIQUE,
                    password TEXT,
                    profile TEXT,
                    bio TEXT,
                    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            '''
        )
        
        #friendships table
        cursor.execute(
            """
                CREATE TABLE IF NOT EXISTS friendships(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_1 INTEGER,
                    user_2 INTEGER,
                    status TEXT,
                    blocked TEXT DEFAULT NULL,
                    last_action INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_1, user_2)
                )
            """
        )
        
        conn.commit()
        
    except Exception as e:
        print(f"{e}    source:{__name__}") #log message
        
    finally:
        conn.close()
        return