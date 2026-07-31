#import inbuilt modules
import os
import jwt
from flask import Blueprint, jsonify, request

#import user created modules
from modules.notification_modules import notifications
from modules.caching import notification_caching

secret = os.getenv("JWT_SECRET")

notification = Blueprint("notification", __name__)


#shared auth check, derives user_id from the cookie instead of trusting client-supplied params
def get_authenticated_user_id():
    token = request.cookies.get("logged_in")
    if not token:
        return None
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload["user"]["id"]
    except Exception:
        return None


@notification.route("/notifications", methods=["GET"])
def get_notifications():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    before_created = request.args.get("before_created_at")
    before_id = request.args.get("before_id")
    before = {"created_at": before_created, "id": before_id} if before_created and before_id else None

    try:
        items = notifications.get_notifications(user_id, before=before, limit=10)

        cached = notification_caching.get_cached_unread(user_id)
        if cached is None:
            #cache miss, recompute from db and resync redis
            cached = notifications.get_unread_count(user_id)
            notification_caching.set_unread(user_id, cached)

        return jsonify({"items": items, "unread_count": cached}), 200

    except Exception as e:
        print(f"{e}   source:{__name__}") #log message
        return jsonify({"message": "Server error"}), 500


@notification.route("/notifications/<int:notification_id>/read", methods=["POST"])
def mark_notification_read(notification_id):
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    try:
        changed = notifications.mark_read(notification_id, user_id)
        if changed:
            notification_caching.decrement_unread(user_id, by=1)
        return jsonify({"message": "ok"}), 200

    except Exception as e:
        print(f"{e}   source:{__name__}") #log message
        return jsonify({"message": "Server error"}), 500


@notification.route("/notifications/read-batch", methods=["POST"])
def mark_notifications_read_batch():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    ids = request.get_json().get("ids", [])
    if not ids:
        return jsonify({"message": "ok"}), 200

    try:
        changed_count = notifications.mark_batch_read(ids, user_id)
        if changed_count > 0:
            notification_caching.decrement_unread(user_id, by=changed_count)
        return jsonify({"message": "ok"}), 200

    except Exception as e:
        print(f"{e}   source:{__name__}") #log message
        return jsonify({"message": "Server error"}), 500