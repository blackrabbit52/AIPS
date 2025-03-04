from . import celery, db
from .models import TeamRole, Recommendation
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

@celery.task
def calculate_team_role_recommendation(personality_traits):
    """Calculer la recommandation de rôle d'équipe basée sur les traits de personnalité."""
    
    # Récupérer tous les rôles disponibles
    roles = TeamRole.query.all()
    
    # Calculer les scores de similarité pour chaque rôle
    scores = []
    for role in roles:
        # Convertir les traits en vecteurs numériques
        role_traits = np.array(list(role.required_traits.values())).reshape(1, -1)
        user_traits = np.array(list(personality_traits.values())).reshape(1, -1)
        
        # Calculer la similarité cosinus
        similarity = cosine_similarity(role_traits, user_traits)[0][0]
        scores.append((role, similarity))
    
    # Trier les rôles par score de similarité
    scores.sort(key=lambda x: x[1], reverse=True)
    
    # Créer une nouvelle recommandation pour le meilleur rôle
    best_role, best_score = scores[0]
    recommendation = Recommendation(
        user_id=1,  # TODO: Use actual user ID from request
        role_id=best_role.id,
        personality_traits=personality_traits,
        score=float(best_score)
    )
    
    db.session.add(recommendation)
    db.session.commit()
    
    return {
        'role_id': best_role.id,
        'role_name': best_role.name,
        'role_description': best_role.description,
        'score': float(best_score),
        'all_recommendations': [
            {
                'role_id': role.id,
                'role_name': role.name,
                'score': float(score)
            }
            for role, score in scores
        ]
    } 