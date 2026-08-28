import functools
from flask import request, jsonify
from supabase import create_client, Client
from app.config import Config

supabase_client: Client = None
if Config.SUPABASE_URL and Config.SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        print(f"[Auth Middleware Warning] Supabase client init error: {e}")


def _resolve_user_from_token():
    """
    Verifies the Supabase Auth JWT in the Authorization header.
    Returns a {id, email} dict on success, or None if missing/invalid.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split("Bearer ")[1].strip()
    if not token or not supabase_client:
        return None
    try:
        user_res = supabase_client.auth.get_user(token)
        if user_res and user_res.user:
            return {"id": user_res.user.id, "email": user_res.user.email}
    except Exception as e:
        print(f"[Auth Error] JWT verification failed: {e}")
    return None


def require_auth(f):
    """
    Enforces a valid Supabase session. Any WanderSync "service" endpoint (chat,
    itinerary generation/editing, admin routes) must be signed in — no guest bypass.
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        if not supabase_client:
            return jsonify({
                "status": "error",
                "message": "Authentication service is not configured on this server."
            }), 503

        user = _resolve_user_from_token()
        if not user:
            return jsonify({
                "status": "error",
                "message": "Please sign in to use this feature."
            }), 401

        request.user = user
        return f(*args, **kwargs)
    return decorated


def _is_admin_flag_true(value) -> bool:
    """Same correct boolean parsing as admin_routes._is_admin_flag_true — kept
    local here to avoid a circular import between auth.py and admin_routes.py."""
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    return str(value).strip().lower() in ("true", "t", "1", "yes")


def require_admin(f):
    """
    Enforces a valid session AND profiles.is_admin = true for that user.
    Stacks on top of require_auth's checks.
    """
    @functools.wraps(f)
    @require_auth
    def decorated(*args, **kwargs):
        try:
            res = supabase_client.table("profiles").select("is_admin").eq(
                "id", request.user["id"]
            ).single().execute()
            if not res.data or not _is_admin_flag_true(res.data.get("is_admin")):
                return jsonify({
                    "status": "error",
                    "message": "Admin access required."
                }), 403
        except Exception as e:
            print(f"[Auth Error] Admin check failed: {e}")
            return jsonify({"status": "error", "message": "Admin verification failed."}), 403

        return f(*args, **kwargs)
    return decorated
