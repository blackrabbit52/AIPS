from rest_framework import serializers
from .models import PersonalityAnalysis, TrainingData, TrainedModel

class PersonalityAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for personality analysis results."""
    
    class Meta:
        model = PersonalityAnalysis
        fields = [
            'id', 'raw_text', 'social_network', 'username',
            'mbti_type', 'mbti_confidence',
            'openness', 'conscientiousness', 'extraversion',
            'agreeableness', 'neuroticism',
            'report', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'mbti_type', 'mbti_confidence',
            'openness', 'conscientiousness', 'extraversion',
            'agreeableness', 'neuroticism',
            'report', 'created_at', 'updated_at'
        ]

class TextAnalysisRequestSerializer(serializers.Serializer):
    """Serializer for text analysis requests."""
    
    text = serializers.CharField(
        help_text="The text to analyze for personality traits."
    )

class PostsAnalysisRequestSerializer(serializers.Serializer):
    """Serializer for multiple posts analysis requests."""
    
    posts = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of text posts to analyze for personality traits."
    )

class SocialMediaAnalysisRequestSerializer(serializers.Serializer):
    """Serializer for social media analysis requests."""
    
    SOCIAL_NETWORKS = [
        ('twitter', 'Twitter'),
        ('facebook', 'Facebook'),
        ('linkedin', 'LinkedIn'),
        ('instagram', 'Instagram'),
    ]
    
    social_network = serializers.ChoiceField(
        choices=SOCIAL_NETWORKS,
        help_text="Social network to analyze posts from."
    )
    username = serializers.CharField(
        help_text="Username of the account to analyze."
    )

class TrainingDataSerializer(serializers.ModelSerializer):
    """Serializer for training datasets."""
    
    class Meta:
        model = TrainingData
        fields = [
            'id', 'model_type', 'dataset_name',
            'source_url', 'file_path',
            'uploaded_at', 'last_used'
        ]
        read_only_fields = ['uploaded_at', 'last_used']

class TrainedModelSerializer(serializers.ModelSerializer):
    """Serializer for trained models."""
    
    class Meta:
        model = TrainedModel
        fields = [
            'id', 'model_type', 'version',
            'file_path', 'metrics', 'is_active',
            'training_data', 'created_at', 'last_used'
        ]
        read_only_fields = ['created_at', 'last_used']

    def validate(self, data):
        """Validate model data."""
        # Check if metrics contain required fields
        metrics = data.get('metrics', {})
        required_metrics = ['accuracy', 'precision', 'recall', 'f1_score']
        
        for metric in required_metrics:
            if metric not in metrics:
                raise serializers.ValidationError(
                    f"The metrics field must contain '{metric}'"
                )
            
            if not isinstance(metrics[metric], (int, float)):
                raise serializers.ValidationError(
                    f"The '{metric}' value must be a number"
                )
        
        return data 