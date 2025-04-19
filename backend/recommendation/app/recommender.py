import json
from typing import Dict, List, Tuple

class TeamRoleRecommender:
    def __init__(self):
        # Define role mappings based on personality traits
        self.role_mappings = {
            "Leader": {
                "traits": ["E", "J"],  # Extraversion, Judging
                "ocean": {"extraversion": 0.7, "conscientiousness": 0.7}
            },
            "Innovator": {
                "traits": ["N", "P"],  # Intuition, Perceiving
                "ocean": {"openness": 0.8, "neuroticism": 0.2}
            },
            "Analyst": {
                "traits": ["T", "J"],  # Thinking, Judging
                "ocean": {"conscientiousness": 0.8, "agreeableness": 0.6}
            },
            "Mediator": {
                "traits": ["F", "P"],  # Feeling, Perceiving
                "ocean": {"agreeableness": 0.8, "neuroticism": 0.2}
            }
        }

    def calculate_role_scores(self, mbti_type: str, ocean_scores: Dict[str, float]) -> List[Tuple[str, float]]:
        """
        Calculate compatibility scores for each team role based on MBTI and OCEAN scores.
        Returns a list of (role, score) tuples sorted by score in descending order.
        """
        role_scores = []
        
        for role, criteria in self.role_mappings.items():
            # Calculate MBTI match score
            mbti_score = sum(1 for trait in criteria["traits"] if trait in mbti_type) / len(criteria["traits"])
            
            # Calculate OCEAN match score
            ocean_score = sum(
                min(ocean_scores.get(trait, 0), criteria["ocean"].get(trait, 0))
                for trait in criteria["ocean"]
            ) / len(criteria["ocean"])
            
            # Combine scores (equal weight for now)
            total_score = (mbti_score + ocean_score) / 2
            role_scores.append((role, total_score))
        
        # Sort by score in descending order
        return sorted(role_scores, key=lambda x: x[1], reverse=True)

    def recommend_role(self, mbti_type: str, ocean_scores: Dict[str, float]) -> Tuple[str, float]:
        """
        Recommend the most suitable team role based on personality traits.
        Returns (recommended_role, confidence_score)
        """
        role_scores = self.calculate_role_scores(mbti_type, ocean_scores)
        return role_scores[0]  # Return the role with highest score

    def get_role_explanation(self, role: str) -> str:
        """
        Get a detailed explanation of why a particular role was recommended.
        """
        explanations = {
            "Leader": "Your personality traits suggest strong leadership qualities. You excel in guiding teams and making decisions.",
            "Innovator": "Your creative and open-minded nature makes you well-suited for generating new ideas and approaches.",
            "Analyst": "Your detail-oriented and logical thinking style is perfect for analyzing complex problems.",
            "Mediator": "Your empathetic and diplomatic nature helps in resolving conflicts and maintaining team harmony."
        }
        return explanations.get(role, "No specific explanation available for this role.") 