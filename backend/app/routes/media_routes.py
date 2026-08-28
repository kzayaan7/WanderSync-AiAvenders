from flask import Blueprint, request, jsonify
from app.services.image_service import ImageService

media_bp = Blueprint("media", __name__, url_prefix="/api/v1/media")


@media_bp.route("/destination-image", methods=["GET"])
def destination_image():
    """
    GET /api/v1/media/destination-image?query=Hunza, Pakistan
    Public (no auth) — used for photo thumbnails on cards across the app.
    Returns {status, url, source}. url is null if no image could be found,
    in which case the frontend falls back to its local default image.
    """
    query = (request.args.get("query") or "").strip()
    if not query:
        return jsonify({"status": "error", "message": "query parameter is required"}), 400

    result = ImageService.get_destination_image(query)
    return jsonify({"status": "success", **result}), 200