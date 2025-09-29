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
                    online BOOLEAN,
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
                        from_id INTEGER,
                        to_id INTEGER,
                        status TEXT,
                        last_action INTEGER,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """
        )
        
        conn.commit()
        
    except Exception as e:
        print(f"{e}    source:{__name__}") #log message
        
    finally:
        conn.close()
        return