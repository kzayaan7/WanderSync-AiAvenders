from flask import Blueprint, jsonify, request
from app.middleware.auth import require_auth, require_admin, supabase_client

admin_bp = Blueprint("admin", __name__, url_prefix="/api/v1/admin")


def _is_admin_flag_true(value) -> bool:
    """
    Interprets is_admin correctly whether the Supabase column is a real
    boolean or (as can happen if it was added by hand) a text column holding
    "true"/"false" strings. A naive bool("false") would be True in Python,
    which is the wrong answer — this checks the actual value, not just truthiness.
    """
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    return str(value).strip().lower() in ("true", "t", "1", "yes")


@admin_bp.route("/me", methods=["GET"])
@require_auth
def check_admin_status():
    """
    Lets the frontend check whether the signed-in user is an admin, so it knows
    whether to show the Control Tower link. Distinguishes "confirmed not admin"
    from "couldn't check" so the frontend never shows a misleading message.
    """
    try:
        res = supabase_client.table("profiles").select("is_admin").eq(
            "id", request.user["id"]
        ).single().execute()
        is_admin = _is_admin_flag_true(res.data.get("is_admin")) if res.data else False
        return jsonify({"status": "success", "is_admin": is_admin, "email": request.user["email"]}), 200
    except Exception as e:
        print(f"[Admin Info] profile lookup failed: {e}")
        # Distinct from "confirmed not admin" — the frontend should show a
        # connection/config error here, not "you're not an admin yet".
        return jsonify({
            "status": "error",
            "message": f"Could not verify admin status: {e}",
            "is_admin": False
        }), 502


@admin_bp.route("/stats", methods=["GET"])
@require_admin
def get_stats():
    """Aggregate counts for the admin dashboard overview cards."""
    def count(table):
        try:
            res = supabase_client.table(table).select("id", count="exact").limit(1).execute()
            return res.count or 0
        except Exception as e:
            print(f"[Admin Info] count({table}) skipped: {e}")
            return 0

    return jsonify({
        "status": "success",
        "stats": {
            "total_users": count("profiles"),
            "total_itineraries": count("itineraries"),
            "total_activities": count("activities"),
            "total_preferences_stored": count("preferences_embeddings"),
        }
    }), 200


@admin_bp.route("/users", methods=["GET"])
@require_admin
def list_users():
    try:
        res = supabase_client.table("profiles").select(
            "id, email, full_name, is_admin, created_at"
        ).order("created_at", desc=True).limit(100).execute()
        return jsonify({"status": "success", "users": res.data or []}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@admin_bp.route("/itineraries", methods=["GET"])
@require_admin
def list_itineraries():
    try:
        res = supabase_client.table("itineraries").select(
            "id, title, destination, user_id, total_estimated_cost, is_public, created_at"
        ).order("created_at", desc=True).limit(100).execute()
        return jsonify({"status": "success", "itineraries": res.data or []}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
