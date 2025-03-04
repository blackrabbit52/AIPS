from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone

class Dataset(models.Model):
    """Model to track downloaded datasets"""
    name = models.CharField(max_length=255)
    source = models.CharField(max_length=100)  # 'kaggle', 'other_platform'
    dataset_id = models.CharField(max_length=255)  # Original ID from the source
    local_path = models.CharField(max_length=500)
    size = models.BigIntegerField()  # Size in bytes
    download_date = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(auto_now=True)
    metadata = models.JSONField(default=dict)

    class Meta:
        unique_together = ('source', 'dataset_id')

class TrainedModel(models.Model):
    """Model to track trained ML models"""
    name = models.CharField(max_length=255)
    model_type = models.CharField(max_length=50)  # 'MBTI', 'OCEAN'
    version = models.CharField(max_length=50)
    local_path = models.CharField(max_length=500)
    training_date = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(auto_now=True)
    metrics = models.JSONField(default=dict)  # Training metrics
    datasets_used = models.ManyToManyField(Dataset)
    parameters = models.JSONField(default=dict)  # Model hyperparameters

class PersonalityAnalysis(models.Model):
    """Model to store personality analysis results"""
    user_id = models.CharField(max_length=255, null=True)  # Optional, for registered users
    social_platform = models.CharField(max_length=50)  # 'twitter', 'linkedin', etc.
    username = models.CharField(max_length=255)
    analysis_date = models.DateTimeField(auto_now_add=True)
    date_range_start = models.DateTimeField()
    date_range_end = models.DateTimeField()
    posts_analyzed = models.IntegerField()
    
    # MBTI Results
    mbti_type = models.CharField(max_length=4)  # e.g., 'INTJ'
    mbti_scores = models.JSONField()  # Detailed scores for each dimension
    
    # OCEAN Results
    ocean_scores = models.JSONField()  # Scores for each OCEAN dimension
    
    # Analysis Details
    confidence_score = models.FloatField()
    interpretation = models.JSONField()  # Detailed interpretation of results
    recommended_roles = ArrayField(models.CharField(max_length=100))
    
    raw_text_analyzed = models.TextField(null=True)  # Optional storage of analyzed text
    model_versions = models.JSONField()  # Versions of models used for analysis
    
    class Meta:
        indexes = [
            models.Index(fields=['username', 'social_platform']),
            models.Index(fields=['analysis_date']),
        ]

class TrainingData(models.Model):
    """Model for managing training datasets."""
    
    MODEL_TYPES = [
        ('mbti', 'MBTI'),
        ('ocean', 'OCEAN'),
    ]
    
    model_type = models.CharField(max_length=10, choices=MODEL_TYPES)
    dataset_name = models.CharField(max_length=100)
    source_url = models.URLField()
    file_path = models.CharField(max_length=255)
    
    # Metadata
    uploaded_at = models.DateTimeField(default=timezone.now)
    last_used = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Training Dataset'
        verbose_name_plural = 'Training Datasets'
    
    def __str__(self):
        return f"{self.dataset_name} ({self.model_type})" 