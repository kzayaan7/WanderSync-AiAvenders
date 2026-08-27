from flask import Blueprint, request, jsonify
from app.utils.validators import ChatMessageRequest
from app.services.groq_service import GroqService
from app.services.vector_service import VectorService
from app.middleware.auth import require_auth

chat_bp = Blueprint("chat", __name__, url_prefix="/api/v1/chat")

@chat_bp.route("/message", methods=["POST"])
@require_auth
def handle_chat_message():
    """
    Parses conversational user inputs, extracts structured travel intent, and personalizes
    the extraction using embeddings of the user's past stated preferences (SRS 1.6.vi).
    """
    try:
        data = request.get_json() or {}
        req_obj = ChatMessageRequest(**data)
        user_id = getattr(request, "user", {}).get("id", "guest")

        # Retrieve semantically similar past preferences (RAG) to inform this extraction
        past_preferences = VectorService.search_user_preferences(user_id, req_obj.message, top_k=3)

        extracted = GroqService.extract_chat_intent(req_obj.message, known_preferences=past_preferences)

        # Persist this message as a new preference embedding for future personalization
        VectorService.store_user_preference(user_id, req_obj.message, category="general")
        
        return jsonify({
            "status": "success",
            "session_id": req_obj.session_id or "session-default-uuid",
            "reply": extracted.get("conversational_reply", "I'm ready to help plan your trip!"),
            "extracted_parameters": {
                "destination": extracted.get("destination"),
                "duration_days": extracted.get("duration_days"),
                "budget_category": extracted.get("budget_category"),
                "total_budget": extracted.get("total_budget"),
                "interests": extracted.get("interests", [])
            },
            "ready_to_generate": extracted.get("ready_to_generate", False),
            "degraded": extracted.get("degraded", False)
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to process chat message: {str(e)}"
        }), 400


@chat_bp.route("/guide", methods=["POST"])
@require_auth
def handle_guide_message():
    """
    Free-form Travel Guide Q&A: packing, luggage, visas, customs, safety, budgeting, etc.
    Distinct from /chat/message, which extracts structured itinerary parameters — this
    endpoint just answers travel questions in plain conversational text.
    """
    try:
        data = request.get_json() or {}
        req_obj = ChatMessageRequest(**data)
        chat_history = data.get("chat_history") or []

        result = GroqService.answer_travel_guide_question(req_obj.message, chat_history=chat_history)

        return jsonify({
            "status": "success",
            "session_id": req_obj.session_id or "guide-session-default-uuid",
            "reply": result.get("reply", "I'm here to help with travel questions!"),
            "degraded": result.get("degraded", False)
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to process guide message: {str(e)}"
        }), 400
