from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from django.core.exceptions import ValidationError
import os
from huggingface_hub import snapshot_download
import logging
import time

logger = logging.getLogger(__name__)

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
    type = models.CharField(max_length=50, default='MBTI')  # 'MBTI', 'OCEAN'

    class Meta:
        unique_together = ('source', 'dataset_id')

    def __str__(self):
        return f"{self.name} ({self.source})"
    
    def get_age(self):
        """Returns the age of the dataset in days"""
        return (timezone.now() - self.download_date).days

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
    is_active = models.BooleanField(default=False)  # Whether this is the active model for its type
    status = models.CharField(max_length=20, default='pending')  # pending, training, completed, failed
    error_message = models.TextField(null=True, blank=True)  # Store error messages if training fails

    def __str__(self):
        return f"{self.name} v{self.version} ({self.model_type})"
    
    def is_recent(self, days=30):
        """Check if model was trained/used recently"""
        return (timezone.now() - self.last_used).days < days

    def mark_as_active(self):
        """Mark this model as active and deactivate others of the same type"""
        TrainedModel.objects.filter(
            model_type=self.model_type,
            is_active=True
        ).exclude(id=self.id).update(is_active=False)
        self.is_active = True
        self.save()

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
    
    def clean(self):
        if len(self.mbti_type) != 4 or not all(c in 'IEFSNTJP' for c in self.mbti_type):
            raise ValidationError('Invalid MBTI type format')
    
    def get_dominant_traits(self):
        """Returns the dominant personality traits"""
        ocean_dominant = {k: v for k, v in self.ocean_scores.items() 
                         if float(v) > 0.7}  # Seuil à 70%
        return ocean_dominant

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

def download_model(model_name, cache_dir=None):
    """
    Download a model from Hugging Face with improved timeout and retry handling.
    
    Args:
        model_name (str): Name of the model to download
        cache_dir (str): Optional directory to cache the model
    """
    if cache_dir is None:
        cache_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
    
    os.makedirs(cache_dir, exist_ok=True)
    
    # Set longer timeout and retry parameters
    timeout = 600  # 10 minutes
    max_retries = 5
    retry_delay = 30  # seconds
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Downloading model {model_name} (attempt {attempt + 1}/{max_retries})")
            
            # Configure the download with longer timeout
            snapshot_download(
                repo_id=model_name,
                cache_dir=cache_dir,
                local_files_only=False,
                force_download=True,
                timeout=timeout,
                resume_download=True,
                proxies=None
            )
            
            logger.info(f"Successfully downloaded model {model_name}")
            return True
            
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                logger.error(f"Failed to download model {model_name} after {max_retries} attempts")
                raise
    
    return False 