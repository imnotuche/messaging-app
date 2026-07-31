#import user defined modules
from modules.database_modules import database

def create_tables():
    #create all tables
    conn=None
    try:
        conn, cursor=database.connect()
        
        #pending signups table (holds signups until OTP verification completes)
        cursor.execute(
            """
                CREATE TABLE IF NOT EXISTS pending_signups(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT UNIQUE,
                    username TEXT UNIQUE,
                    password TEXT,
                    last_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
        )
        
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

        #email queue table
        cursor.execute(
            """
                CREATE TABLE IF NOT EXISTS email_queue(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    recipient TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    body TEXT NOT NULL,
                    status TEXT DEFAULT 'PENDING',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
        )
        
        #notifications table
        cursor.execute(
            """
                CREATE TABLE IF NOT EXISTS notifications(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    recipient_id INTEGER NOT NULL,
                    actor_id INTEGER NOT NULL,
                    type TEXT NOT NULL,
                    payload TEXT,
                    is_read INTEGER NOT NULL DEFAULT 0,
                    read_at TIMESTAMP DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
        )

        cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON notifications (recipient_id, created_at DESC)"
        )

        cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON notifications (recipient_id, is_read)"
        )
        
        conn.commit()
        print("Tables created")
        
    except Exception as e:
        print(f"{e}    source:{__name__}") #log message
        
    finally:
        if conn:
            conn.close()