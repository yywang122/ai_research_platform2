from flask import Flask

from .config import Config
from .core.db import close_db, init_db
from .core.errors import ApiError
from .core.response import error_response
from .routes.analyze import bp as analyze_bp
from .routes.auth import bp as auth_bp
from .routes.favorites import bp as favorites_bp
from .routes.papers import bp as papers_bp
from .routes.reading_list import bp as reading_list_bp
from .routes.recommendations import bp as recommendations_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    with app.app_context():
        init_db()

    app.teardown_appcontext(close_db)

    app.register_blueprint(auth_bp)
    app.register_blueprint(papers_bp)
    app.register_blueprint(favorites_bp)
    app.register_blueprint(reading_list_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(recommendations_bp)

    @app.errorhandler(ApiError)
    def handle_api_error(err: ApiError):
        return error_response(err.code, err.message, err.status_code)

    @app.errorhandler(404)
    def handle_404(_):
        return error_response("NOT_FOUND", "Resource not found", 404)

    @app.errorhandler(405)
    def handle_405(_):
        return error_response("METHOD_NOT_ALLOWED", "Method not allowed", 405)

    @app.errorhandler(Exception)
    def handle_unexpected(_):
        return error_response("INTERNAL_ERROR", "Unexpected server error", 500)

    return app

