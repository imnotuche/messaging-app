#import inbuilt modules
import time
import sys
from pathlib import Path

#adjusting path to allow module imports from parent directories
sys.path.append(str(Path(__file__).parent.parent))

#import user created modules
from modules import send_email
from modules.database_modules import database

def process_email_queue():
    print("Email worker engine started successfully...")
    
    while True:
        conn = None
        try:
            #connect to database
            conn, cursor = database.connect()
            
            #fetch all pending emails in the queue
            cursor.execute("SELECT * FROM email_queue WHERE status='PENDING' ORDER BY created_at ASC")
            jobs = cursor.fetchall()
            
            if jobs:
                print(f"Found {len(jobs)} pending email(s) to process.")
                
                for job in jobs:
                    try:
                        #attempt to send the email via your email module
                        send_email.send_mail(job["recipient"], job["subject"], job["body"])
                        print(f"Successfully sent email to {job['recipient']}")
                        
                        #delete item from queue upon successful confirmation
                        cursor.execute("DELETE FROM email_queue WHERE id=?", (job["id"],))
                        conn.commit()
                        
                    except Exception as email_error:
                        print(f"Failed to send email to {job['recipient']}: {str(email_error)}")
                        #mark as failed to prevent immediate infinite loop retrying on this specific error
                        cursor.execute("UPDATE email_queue SET status='FAILED' WHERE id=?", (job["id"],))
                        conn.commit()
                        
            #close connection cleanly before resting
            conn.close()
            
        except Exception as db_error:
            print(f"Database worker error occurred: {str(db_error)}")
            if conn: conn.close()
            
        #sleep for 5 seconds before checking the database again
        time.sleep(5)

if __name__ == "__main__":
    process_email_queue()