from flask import Blueprint, request, jsonify
from .models import TeamRole, Recommendation
from . import db
from .tasks import calculate_team_role_recommendation
from sqlalchemy import text

recommendation_bp = Blueprint('recommendation', __name__)

@recommendation_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    try:
        # Check database connection
        db.session.execute(text('SELECT 1'))
        db.session.commit()
        return jsonify({'status': 'healthy'})
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 503

@recommendation_bp.route('/team-role', methods=['POST'])
def recommend_team_role():
    data = request.get_json()
    
    if not data or 'personality_traits' not in data:
        return jsonify({'error': 'Personality traits are required'}), 400
    
    # Lancer la tâche de calcul de recommandation
    task = calculate_team_role_recommendation.delay(data['personality_traits'])
    
    return jsonify({
        'task_id': task.id,
        'message': 'Team role recommendation calculation started'
    }), 202

@recommendation_bp.route('/roles', methods=['GET'])
def get_roles():
    roles = TeamRole.query.all()
    return jsonify([{
        'id': role.id,
        'name': role.name,
        'description': role.description,
        'required_traits': role.required_traits
    } for role in roles]) 