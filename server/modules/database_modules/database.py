#import inbuilt modules
import os
from pathlib import Path
import sqlite3
from dotenv import load_dotenv

load_dotenv()

#creating directory for db storage
project_dir = Path(__file__).parent.parent.parent.parent
files_dir = project_dir / "files"/ "database"
os.makedirs(files_dir, exist_ok=True)
db_path=os.path.join(files_dir, os.getenv("DB_NAME"))

print(f"Database engine successfully linked target storage context to {os.getenv('DB_NAME')}    source: {__name__}") #log message

def connect():
    # create or connect to database file
    conn = sqlite3.connect(db_path, timeout=30)
    #Set the connection to return Row objects
    conn.row_factory = sqlite3.Row 
    # create a table
    cursor=conn.cursor()
    
    return conn, cursor

