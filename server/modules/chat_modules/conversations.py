#import inbuilt modules
import sqlite3

#import user created modules
from modules.database_modules import database

#returns existing conversation id for this friendship, creates one if it doesnt exist, raises if theyre not accepted friends
def get_or_create_conversation(user_id, other_user_id):
    conn=None
    try:
        conn, cursor=database.connect()

        #friendship ids stored smaller first, larger second
        low=min(int(user_id), int(other_user_id))
        high=max(int(user_id), int(other_user_id))

        cursor.execute(
            "SELECT id FROM friendships WHERE user_1 = ? AND user_2 = ? AND status = ?",
            (low, high, "friends")
        )
        friendship=cursor.fetchone()

        if not friendship:
            raise Exception(f"not friends   source:{__name__}")

        friendship_id=friendship["id"]

        cursor.execute(
            "SELECT id FROM conversations WHERE friendship_id = ?",
            (friendship_id,)
        )
        existing=cursor.fetchone()

        if existing:
            return existing["id"]

        #not found, try to create it
        try:
            cursor.execute(
                "INSERT INTO conversations (friendship_id, created_at) VALUES (?, CURRENT_TIMESTAMP)",
                (friendship_id,)
            )
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            #other side beat us to it, their insert already committed so just re select
            cursor.execute(
                "SELECT id FROM conversations WHERE friendship_id = ?",
                (friendship_id,)
            )
            return cursor.fetchone()["id"]

    finally:
        if conn:
            conn.close()

#confirms this user actually belongs to the conversation, returns the other users id too
def get_participant_check(conversation_id, user_id):
    conn=None
    try:
        conn, cursor=database.connect()

        cursor.execute(
            """
                SELECT f.user_1, f.user_2 FROM conversations c
                JOIN friendships f ON f.id = c.friendship_id
                WHERE c.id = ?
            """,
            (conversation_id,)
        )
        row=cursor.fetchone()

        if not row:
            return False, None
        if row["user_1"] == int(user_id):
            return True, row["user_2"]
        elif row["user_2"] == int(user_id):
            return True, row["user_1"]
        else:
            return False, None

    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

    finally:
        if conn:
            conn.close()

#inserts a new message row, returns the full row for socket emit
def create_message(conversation_id, sender_id, receiver_id, message, client_id):
    conn=None
    try:
        conn, cursor=database.connect()

        cursor.execute(
            "INSERT INTO messages (conversation_id, sender_id, receiver_id, message, client_id, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
            (conversation_id, sender_id, receiver_id, message, client_id)
        )
        conn.commit()

        cursor.execute("SELECT * FROM messages WHERE id = ?", (cursor.lastrowid,))
        return dict(cursor.fetchone())

    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

    finally:
        if conn:
            conn.close()

#flips is_received true for a single message, called on live socket ack
def mark_delivered(message_id):
    conn=None
    try:
        conn, cursor=database.connect()

        cursor.execute(
            "UPDATE messages SET is_received = 1, received_at = CURRENT_TIMESTAMP WHERE id = ? AND is_received = 0",
            (message_id,)
        )
        conn.commit()

    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

    finally:
        if conn:
            conn.close()

#fallback delivery marking, fetching a conversations messages via rest means they reached the device regardless of the live socket ack
def mark_delivered_for_conversation(conversation_id, receiver_id):
    conn=None
    try:
        conn, cursor=database.connect()

        cursor.execute(
            "UPDATE messages SET is_received = 1, received_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND receiver_id = ? AND is_received = 0",
            (conversation_id, receiver_id)
        )
        conn.commit()

    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

    finally:
        if conn:
            conn.close()

#same fallback but across every conversation at once, used by the sync route
def mark_delivered_since(user_id, since):
    conn=None
    try:
        conn, cursor=database.connect()

        cursor.execute(
            "UPDATE messages SET is_received = 1, received_at = CURRENT_TIMESTAMP WHERE receiver_id = ? AND created_at > ? AND is_received = 0",
            (user_id, since)
        )
        conn.commit()

    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

    finally:
        if conn:
            conn.close()

#bulk marks unread messages as read, returns the ids that were flipped, also backfills is_received since opening the chat implies delivery too
def mark_read(conversation_id, receiver_id):
    conn=None
    try:
        conn, cursor=database.connect()

        cursor.execute(
            """
                UPDATE messages
                SET is_read = 1, read_at = CURRENT_TIMESTAMP, is_received = 1, received_at = COALESCE(received_at, CURRENT_TIMESTAMP)
                WHERE conversation_id = ? AND receiver_id = ? AND is_read = 0
                RETURNING id
            """,
            (conversation_id, receiver_id)
        )
        updated_ids=[row["id"] for row in cursor.fetchall()]
        conn.commit()

        return updated_ids

    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

    finally:
        if conn:
            conn.close()

#every conversation this user is in, with the other users id, last message, and unread count
def get_conversations_for_user(user_id):
    conn=None
    try:
        conn, cursor=database.connect()

        cursor.execute(
            """
                SELECT
                    c.id AS conversation_id,
                    CASE WHEN f.user_1 = ? THEN f.user_2 ELSE f.user_1 END AS other_user_id,
                    lm.message AS last_message,
                    lm.created_at AS last_message_time,
                    lm.sender_id AS last_message_sender_id,
                    (
                        SELECT COUNT(*) FROM messages m
                        WHERE m.conversation_id = c.id AND m.receiver_id = ? AND m.is_read = 0
                    ) AS unread_count
                FROM conversations c
                JOIN friendships f ON f.id = c.friendship_id
                LEFT JOIN messages lm ON lm.id = (
                    SELECT id FROM messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1
                )
                WHERE f.user_1 = ? OR f.user_2 = ?
                ORDER BY lm.created_at DESC
            """,
            (user_id, user_id, user_id, user_id)
        )

        return [dict(row) for row in cursor.fetchall()]

    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

    finally:
        if conn:
            conn.close()

#lightweight version for the conversation_update socket ping, one conversations last message and unread count
def get_conversation_summary(conversation_id, user_id):
    conn=None
    try:
        conn, cursor=database.connect()

        cursor.execute(
            """
                SELECT
                    lm.message AS last_message,
                    lm.created_at AS last_message_time,
                    lm.sender_id AS last_message_sender_id,
                    (
                        SELECT COUNT(*) FROM messages m
                        WHERE m.conversation_id = ? AND m.receiver_id = ? AND m.is_read = 0
                    ) AS unread_count
                FROM messages lm
                WHERE lm.id = (
                    SELECT id FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 1
                )
            """,
            (conversation_id, user_id, conversation_id)
        )

        row=cursor.fetchone()
        return dict(row) if row else {"last_message": None, "last_message_time": None, "last_message_sender_id": None, "unread_count": 0}

    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

    finally:
        if conn:
            conn.close()

#cursor paginated message history, newest first page, before_id walks further back for scroll up
def get_messages(conversation_id, before_id, limit):
    conn=None
    try:
        conn, cursor=database.connect()

        if before_id:
            cursor.execute(
                "SELECT * FROM messages WHERE conversation_id = ? AND id < ? ORDER BY id DESC LIMIT ?",
                (conversation_id, before_id, limit)
            )
        else:
            cursor.execute(
                "SELECT * FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?",
                (conversation_id, limit)
            )

        return [dict(row) for row in cursor.fetchall()]

    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

    finally:
        if conn:
            conn.close()

#everything this user needs after being offline, new messages plus status ticks on messages they sent
def get_sync_data(user_id, since):
    conn=None
    try:
        conn, cursor=database.connect()

        cursor.execute(
            "SELECT * FROM messages WHERE receiver_id = ? AND created_at > ? ORDER BY id ASC",
            (user_id, since)
        )
        new_messages=[dict(row) for row in cursor.fetchall()]

        cursor.execute(
            "SELECT id, is_received, received_at, is_read, read_at FROM messages WHERE sender_id = ? AND (received_at > ? OR read_at > ?)",
            (user_id, since, since)
        )
        status_updates=[dict(row) for row in cursor.fetchall()]

        return {"new_messages": new_messages, "status_updates": status_updates}

    except Exception as e:
        raise Exception(f"{e}   source:{__name__}")

    finally:
        if conn:
            conn.close()