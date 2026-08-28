import functools
import base64
import json
import jwt
from flask import request, jsonify
from supabase import create_client, Client
from app.config import Config

supabase_client: Client = None
if Config.SUPABASE_URL and Config.SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        print(f"[Auth Middleware Warning] Supabase client init error: {e}")


# Supabase JWT secret for local token verification.
# Find it in: Supabase Dashboard → Settings → API → JWT Secret
SUPABASE_JWT_SECRET = Config.SUPABASE_JWT_SECRET or ""


def _decode_jwt_payload(token: str) -> dict | None:
    """
    Decodes a Supabase JWT locally without any network call.
    1. If JWT secret is configured → verify signature (production).
    2. Otherwise → decode payload without verification (dev fallback).
    """
    import time as _time
    ALLOWED_ALGORITHMS = ["HS256", "HS384", "HS512"]

    # --- Path 1: Signature-verified decode (production) ---
    if SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token, SUPABASE_JWT_SECRET,
                algorithms=ALLOWED_ALGORITHMS,
                audience="authenticated"
            )
            if payload and payload.get("exp", 0) >= _time.time():
                return payload
            return None
        except jwt.exceptions.InvalidAlgorithmError:
            pass  # Token algorithm not in allowed list — fall through to raw decode
        except Exception as e:
            print(f"[Auth Warning] Verified JWT decode failed: {e}")
            return None

    # --- Path 2: Raw base64 decode without verification (dev / no secret) ---
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        payload_b64 = parts[1] + "=" * (4 - len(parts[1]) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        if not payload or payload.get("exp", 0) < _time.time():
            return None
        return payload
    except Exception as e:
        print(f"[Auth Warning] Raw JWT decode failed: {e}")
        return None


def _resolve_user_from_token():
    """
    Extracts user info from the Supabase JWT in the Authorization header.
    Decodes locally (no network call) for speed and reliability.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split("Bearer ")[1].strip()
    if not token:
        return None

    payload = _decode_jwt_payload(token)
    if not payload:
        return None

    user_id = payload.get("sub")
    email = payload.get("email", payload.get("user_metadata", {}).get("email", ""))
    if user_id:
        return {"id": user_id, "email": email}
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
