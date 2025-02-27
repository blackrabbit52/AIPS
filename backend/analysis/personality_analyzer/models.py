from django.db import models
from django.utils import timezone

class PersonalityAnalysis(models.Model):
    """Model for storing personality analysis results."""
    
    # Input data
    raw_text = models.TextField()
    social_network = models.CharField(max_length=50, null=True, blank=True)
    username = models.CharField(max_length=100, null=True, blank=True)
    
    # MBTI results
    mbti_type = models.CharField(max_length=4)
    mbti_confidence = models.FloatField()
    
    # OCEAN model results (Big Five)
    openness = models.FloatField()
    conscientiousness = models.FloatField()
    extraversion = models.FloatField()
    agreeableness = models.FloatField()
    neuroticism = models.FloatField()
    
    # Analysis report
    report = models.JSONField()
    
    # Metadata
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Personality Analysis'
        verbose_name_plural = 'Personality Analyses'
    
    def __str__(self):
        return f"Analysis {self.id} - {self.mbti_type}"

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

class TrainedModel(models.Model):
    """Model for managing trained ML models."""
    
    MODEL_TYPES = [
        ('mbti', 'MBTI'),
        ('ocean', 'OCEAN'),
    ]
    
    model_type = models.CharField(max_length=10, choices=MODEL_TYPES)
    version = models.CharField(max_length=20)
    file_path = models.CharField(max_length=255)
    metrics = models.JSONField()
    is_active = models.BooleanField(default=False)
    
    # Relations
    training_data = models.ForeignKey(TrainingData, on_delete=models.PROTECT)
    
    # Metadata
    created_at = models.DateTimeField(default=timezone.now)
    last_used = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Trained Model'
        verbose_name_plural = 'Trained Models'
    
    def __str__(self):
        return f"{self.model_type} v{self.version}" 