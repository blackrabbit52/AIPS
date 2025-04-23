from rest_framework import serializers
from .models import PersonalityAnalysis, TrainingData, TrainedModel, Dataset
from django.core.validators import MinValueValidator, MaxValueValidator
from typing import Dict, List

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

    def validate_mbti_type(self, value):
        """Validate MBTI type"""
        if len(value) != 4 or not all(c in 'IEFSNTJP' for c in value):
            raise serializers.ValidationError("Invalid MBTI type format")
        return value

    def validate_ocean_scores(self, value):
        """Validate OCEAN scores"""
        required_traits = ['openness', 'conscientiousness', 'extraversion', 
                         'agreeableness', 'neuroticism']
        if not all(trait in value for trait in required_traits):
            raise serializers.ValidationError(
                f"OCEAN scores must contain: {', '.join(required_traits)}"
            )
        
        #Check that the scores are between 0 and 1
        for trait, score in value.items():
            if not 0 <= float(score) <= 1:
                raise serializers.ValidationError(
                    f"Score for {trait} must be between 0 and 1"
                )
        return value

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

    def validate_source_url(self, value):
        """Valid URL source"""
        if not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("Invalid URL format")
        return value

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

    def validate_size(self, value):
        """Validate the size of the dataset"""
        if value <= 0:
            raise serializers.ValidationError("Dataset size must be positive")
        return value

    def validate_metadata(self, value):
        """Validate the size of the dataset"""
        required_keys = ['description', 'format', 'version']
        if not all(key in value for key in required_keys):
            raise serializers.ValidationError(
                f"Metadata must contain: {', '.join(required_keys)}"
            )
        return value

class TrainedModelSerializer(serializers.ModelSerializer):
    """Serializer for trained models."""
    
    accuracy = serializers.FloatField(source='metrics.accuracy', read_only=True)
    f1_score = serializers.FloatField(source='metrics.f1_score', read_only=True)
    datasets_used = DatasetSerializer(many=True, read_only=True)

    class Meta:
        model = TrainedModel
        fields = [
            'id', 'name', 'model_type', 'version', 'local_path',
            'training_date', 'last_used', 'metrics', 'datasets_used',
            'parameters', 'accuracy', 'f1_score'
        ]
        read_only_fields = ['training_date', 'last_used', 'metrics']

    def validate_model_type(self, value):
        """Valid model type"""
        valid_types = ['MBTI', 'OCEAN']
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Model type must be one of: {', '.join(valid_types)}"
            )
        return value

    def validate_parameters(self, value):
        """Valid model parameters"""
        required_params = ['batch_size', 'learning_rate', 'epochs']
        if not all(param in value for param in required_params):
            raise serializers.ValidationError(
                f"Parameters must contain: {', '.join(required_params)}"
            )
        return value

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
        child=serializers.IntegerField(min_value=1)
    )
    model_type = serializers.ChoiceField(choices=['MBTI', 'OCEAN'])
    parameters = serializers.DictField(required=False)

    def validate_parameters(self, value):
        """Validate the training parameters"""
        default_params = {
            'batch_size': 32,
            'learning_rate': 2e-5,
            'epochs': 10,
            'validation_split': 0.2
        }
        return {**default_params, **value}

class AnalysisRequestSerializer(serializers.Serializer):
    """
    Serializer for analysis requests
    """
    text = serializers.CharField(required=False)
    platform = serializers.CharField(required=False)
    username = serializers.CharField(required=False)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)

    def validate(self, data):
        """Valider la cohérence des données"""
        if 'text' in data:
            # Validate data consistency
            if len(data['text'].strip()) < 100:
                raise serializers.ValidationError(
                    "Text must be at least 100 characters long"
                )
        else:
            # Validation for direct text analysis
            required_fields = ['platform', 'username', 'start_date', 'end_date']
            if not all(field in data for field in required_fields):
                raise serializers.ValidationError(
                    f"For social media analysis, required fields are: {', '.join(required_fields)}"
                )
            
            #Check that start_date is before end_date
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError(
                    "start_date must be before end_date"
                )

            # Validate the platform
            valid_platforms = ['twitter', 'facebook', 'linkedin']
            if data['platform'].lower() not in valid_platforms:
                raise serializers.ValidationError(
                    f"Platform must be one of: {', '.join(valid_platforms)}"
                )

        return data 