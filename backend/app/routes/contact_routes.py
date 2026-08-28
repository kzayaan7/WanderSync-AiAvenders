import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from app.utils.validators import ContactMessageRequest
from app.middleware.auth import supabase_client

contact_bp = Blueprint("contact", __name__, url_prefix="/api/v1/contact")

# In-memory fallback so the form still "works" (and admins can still see
# submissions during the same warm instance) if Supabase is unreachable —
# mirrors the same fallback pattern used by ITINERARY_STORE.
CONTACT_STORE = []


@contact_bp.route("", methods=["POST"])
def submit_contact_message():
    """Public endpoint (no auth) — anyone can send a message via the Contact page."""
    try:
        payload = request.get_json() or {}
        validated = ContactMessageRequest(**payload)

        record = {
            "id": str(uuid.uuid4()),
            "name": validated.name,
            "email": validated.email,
            "subject": validated.subject,
            "message": validated.message,
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        persisted = False
        if supabase_client:
            try:
                supabase_client.table("contact_messages").insert({
                    "id": record["id"],
                    "name": record["name"],
                    "email": record["email"],
                    "subject": record["subject"],
                    "message": record["message"]
                }).execute()
                persisted = True
            except Exception as e:
                print(f"[Contact Warning] Supabase insert failed, using in-memory fallback: {e}")

        if not persisted:
            CONTACT_STORE.append(record)

        return jsonify({
            "status": "success",
            "message": "Thanks for reaching out — we'll get back to you soon."
        }), 201

    except ValidationError as ve:
        return jsonify({"status": "error", "message": ve.errors()[0].get("msg", "Invalid input")}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400