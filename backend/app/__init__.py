from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.routes.chat_routes import chat_bp
from app.routes.itinerary_routes import itinerary_bp
from app.routes.admin_routes import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend SPA requests
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register Route Blueprints
    app.register_blueprint(chat_bp)
    app.register_blueprint(itinerary_bp)
    app.register_blueprint(admin_bp)

    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "WanderSync-Backend-API",
            "version": "1.0.0",
            "llm_provider": "Groq (Llama-3.3-70b-versatile)",
            "database": "Supabase PostgreSQL + pgvector"
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"status": "error", "message": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"status": "error", "message": "Internal server error"}), 500

    return app
