from flask import Blueprint, g, request

from ..core.response import success_response
from ..middleware.auth import auth_required
from ..services.recommendation_service import generate_recommendations_for_user

bp = Blueprint("recommendations", __name__, url_prefix="/api/recommendations")


@bp.get("")
@auth_required
def get_recommendations():
    try:
        top_k = min(max(int(request.args.get("top_k", 10)), 1), 50)
    except ValueError:
        top_k = 10
    rows = generate_recommendations_for_user(g.current_user["id"], top_k=top_k)
    return success_response(rows, meta={"top_k": top_k})

