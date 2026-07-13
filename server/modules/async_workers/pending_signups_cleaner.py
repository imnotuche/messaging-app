#import inbuilt modules
from apscheduler.schedulers.background import BackgroundScheduler

#import user created modules
from modules.database_modules import database

#deletes pending signups whose last sent code is older than 10 minutes
def delete_stale_pending_signups():
    conn=None
    try:
        conn, cursor=database.connect()
        cursor.execute("DELETE FROM pending_signups WHERE last_sent_at < datetime('now', '-10 minutes')")
        deleted=cursor.rowcount
        conn.commit()

        if deleted:
            print(f"cleaned up {deleted} stale pending signups   source:{__name__}") #log message

    except Exception as e:
        print(f"error: {str(e)}   source:{__name__}") #log message

    finally:
        if conn:
            conn.close()

#starts the background scheduler, call once from app entrypoint
def start_pending_signups_cleanup_scheduler():
    scheduler=BackgroundScheduler()
    scheduler.add_job(delete_stale_pending_signups, "interval", minutes=15)
    scheduler.start()
    return scheduler