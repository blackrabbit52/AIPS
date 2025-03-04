from rest_framework import serializers
from .models import PersonalityAnalysis, TrainingData, TrainedModel, Dataset

class PersonalityAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for personality analysis results."""
    
    class Meta:
        model = PersonalityAnalysis
        fields = [
            'id', 'user_id', 'social_platform', 'username',
            'analysis_date', 'date_range_start', 'date_range_end',
            'posts_analyzed', 'mbti_type', 'mbti_scores',
            'ocean_scores', 'confidence_score', 'interpretation',
            'recommended_roles', 'raw_text_analyzed', 'model_versions'
        ]
        read_only_fields = [
            'analysis_date', 'confidence_score', 'interpretation',
            'recommended_roles', 'model_versions'
        ]

class TextAnalysisRequestSerializer(serializers.Serializer):
    """Serializer for text analysis requests."""
    
    text = serializers.CharField(
        help_text="The text to analyze for personality traits.",
        required=True
    )

class PostsAnalysisRequestSerializer(serializers.Serializer):
    """Serializer for multiple posts analysis requests."""
    
    posts = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of text posts to analyze for personality traits."
    )

class SocialMediaAnalysisRequestSerializer(serializers.Serializer):
    """Serializer for social media analysis requests."""
    
    username = serializers.CharField(required=True)
    platform = serializers.ChoiceField(
        choices=['twitter', 'linkedin', 'facebook'],
        required=True
    )
    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=False)

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

class DatasetSerializer(serializers.ModelSerializer):
    """
    Serializer for Dataset model
    """
    class Meta:
        model = Dataset
        fields = [
            'id', 'name', 'source', 'dataset_id', 'local_path',
            'size', 'download_date', 'last_used', 'metadata'
        ]
        read_only_fields = [
            'download_date', 'last_used', 'size', 'local_path'
        ]

class TrainedModelSerializer(serializers.ModelSerializer):
    """Serializer for trained models."""
    
    datasets_used = DatasetSerializer(many=True, read_only=True)

    class Meta:
        model = TrainedModel
        fields = [
            'id', 'name', 'model_type', 'version', 'local_path',
            'training_date', 'last_used', 'metrics', 'parameters',
            'datasets_used'
        ]
        read_only_fields = [
            'training_date', 'last_used', 'local_path', 'version'
        ]

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

class DatasetFetchRequestSerializer(serializers.Serializer):
    """
    Serializer for dataset fetch request
    """
    dataset_id = serializers.CharField(required=True)
    source = serializers.ChoiceField(
        choices=['kaggle'],
        default='kaggle'
    )

class ModelTrainingRequestSerializer(serializers.Serializer):
    """
    Serializer for model training request
    """
    dataset_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )
    model_type = serializers.ChoiceField(
        choices=['MBTI', 'OCEAN'],
        required=True
    ) 