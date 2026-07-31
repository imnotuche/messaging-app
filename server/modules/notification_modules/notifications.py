#import inbuilt modules
import json

#import user created modules
from modules.database_modules import database


#insert a new notification row, returns the full row as a dict for immediate socket emit
def create_notification(recipient_id, actor_id, type_, payload=None):
    conn = None

    try:
        conn, cursor = database.connect()

        cursor.execute(
            "INSERT INTO notifications (recipient_id, actor_id, type, payload) VALUES (?, ?, ?, ?)",
            (recipient_id, actor_id, type_, json.dumps(payload) if payload else None)
        )

        conn.commit()
        notification_id = cursor.lastrowid

        cursor.execute("SELECT * FROM notifications WHERE id = ?", (notification_id,))
        row = cursor.fetchone()

        print(f"created notification {notification_id} for user {recipient_id}    source:{__name__}") #log message

        return _serialize(row)

    finally:
        if conn:
            conn.close()


#cursor paginated fetch, created_at + id as tiebreaker so same-millisecond inserts dont get skipped or duped
def get_notifications(recipient_id, before=None, limit=10):
    conn = None

    try:
        conn, cursor = database.connect()

        if before:
            cursor.execute(
                """
                    SELECT * FROM notifications
                    WHERE recipient_id = ? AND (created_at < ? OR (created_at = ? AND id < ?))
                    ORDER BY created_at DESC, id DESC
                    LIMIT ?
                """,
                (recipient_id, before["created_at"], before["created_at"], before["id"], limit)
            )
        else:
            cursor.execute(
                "SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC, id DESC LIMIT ?",
                (recipient_id, limit)
            )

        rows = cursor.fetchall()
        return [_serialize(r) for r in rows]

    finally:
        if conn:
            conn.close()


#authoritative unread count, redis cache should mirror this but this is the source of truth on cache miss
def get_unread_count(recipient_id):
    conn = None

    try:
        conn, cursor = database.connect()

        cursor.execute(
            "SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ? AND is_read = 0",
            (recipient_id,)
        )
        row = cursor.fetchone()
        return row["count"]

    finally:
        if conn:
            conn.close()


#marks a single notification read, scoped to recipient_id so a user cant mark someone elses notification read by guessing an id
def mark_read(notification_id, recipient_id):
    conn = None

    try:
        conn, cursor = database.connect()

        cursor.execute(
            "UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ? AND recipient_id = ? AND is_read = 0",
            (notification_id, recipient_id)
        )

        conn.commit()
        return cursor.rowcount > 0 #true only if this call actually flipped it, not if it was already read

    finally:
        if conn:
            conn.close()


#marks a batch of ids read at once, used for the "opened dropdown, visible batch read" case
def mark_batch_read(notification_ids, recipient_id):
    conn = None

    try:
        conn, cursor = database.connect()

        placeholders = ",".join("?" * len(notification_ids))
        cursor.execute(
            f"UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id IN ({placeholders}) AND recipient_id = ? AND is_read = 0",
            (*notification_ids, recipient_id)
        )

        conn.commit()
        return cursor.rowcount

    finally:
        if conn:
            conn.close()


#stale-notification cleanup, e.g. accepting a request should silence the original request notification
def mark_read_by_type_and_actor(recipient_id, actor_id, type_):
    conn = None

    try:
        conn, cursor = database.connect()

        cursor.execute(
            "UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE recipient_id = ? AND actor_id = ? AND type = ? AND is_read = 0",
            (recipient_id, actor_id, type_)
        )

        conn.commit()

    finally:
        if conn:
            conn.close()


def _serialize(row):
    return {
        "id": row["id"],
        "recipient_id": row["recipient_id"],
        "actor_id": row["actor_id"],
        "type": row["type"],
        "payload": json.loads(row["payload"]) if row["payload"] else None,
        "is_read": bool(row["is_read"]),
        "read_at": row["read_at"],
        "created_at": row["created_at"],
    }