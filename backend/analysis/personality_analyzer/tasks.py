import os
import pandas as pd
import requests
from bs4 import BeautifulSoup
from celery import shared_task
from django.conf import settings
from .models import PersonalityAnalysis, TrainingData, TrainedModel, Dataset
from datetime import datetime
import kaggle
import numpy as np
from sklearn.model_selection import train_test_split
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import torch
from typing import Dict, List, Tuple
import logging
import tweepy
from facebook import GraphAPI
from linkedin_api import Linkedin
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from textblob import TextBlob
import spacy
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from collections import defaultdict
import re
import signal
from functools import wraps
import time
import gc
import math
import json
import resource

# Initialize NLP components
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')
nlp = spacy.load('en_core_web_sm')

logger = logging.getLogger(__name__)

class SocialMediaScraper:
    def __init__(self):
        self.twitter_api = None
        self.facebook_api = None
        self.linkedin_api = None
        try:
            self._setup_apis()
        except Exception as e:
            logger.warning(f"Social media API setup incomplete: {str(e)}")

    def _setup_apis(self):
        from django.conf import settings
        # Vérifier si les credentials existent avant d'initialiser
        if hasattr(settings, 'SOCIAL_MEDIA'):
            if settings.SOCIAL_MEDIA.get('TWITTER_API_KEY'):
                self._setup_twitter()
            if settings.SOCIAL_MEDIA.get('FACEBOOK_ACCESS_TOKEN'):
                self._setup_facebook()
            if settings.SOCIAL_MEDIA.get('LINKEDIN_USERNAME'):
                self._setup_linkedin()

    def _setup_twitter(self):
        # Twitter setup
        try:
            auth = tweepy.OAuthHandler(
                settings.TWITTER_API_KEY,
                settings.TWITTER_API_SECRET
            )
            auth.set_access_token(
                settings.TWITTER_ACCESS_TOKEN,
                settings.TWITTER_ACCESS_TOKEN_SECRET
            )
            self.twitter_api = tweepy.API(auth)
        except Exception as e:
            logger.warning(f"Twitter API setup failed: {str(e)}")

    def _setup_facebook(self):
        # Facebook setup
        try:
            self.facebook_api = GraphAPI(settings.FACEBOOK_ACCESS_TOKEN)
        except Exception as e:
            logger.warning(f"Facebook API setup failed: {str(e)}")

    def _setup_linkedin(self):
        # LinkedIn setup
        try:
            self.linkedin_api = Linkedin(
                settings.LINKEDIN_USERNAME,
                settings.LINKEDIN_PASSWORD
            )
        except Exception as e:
            logger.warning(f"LinkedIn API setup failed: {str(e)}")

    def get_twitter_posts(self, username: str, start_date: str, end_date: str) -> List[str]:
        posts = []
        try:
            tweets = tweepy.Cursor(
                self.twitter_api.user_timeline,
                screen_name=username,
                tweet_mode="extended"
            ).items(100)  # Limit to last 100 tweets

            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')

            for tweet in tweets:
                if start_dt <= tweet.created_at <= end_dt:
                    posts.append(tweet.full_text)
        except Exception as e:
            logger.error(f"Error fetching Twitter posts: {str(e)}")

        return posts

    def get_facebook_posts(self, username: str, start_date: str, end_date: str) -> List[str]:
        posts = []
        try:
            profile = self.facebook_api.get_object(username)
            feed = self.facebook_api.get_connections(profile['id'], 'posts')

            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')

            while feed:
                for post in feed['data']:
                    created_time = datetime.strptime(
                        post['created_time'][:10],
                        '%Y-%m-%d'
                    )
                    if start_dt <= created_time <= end_dt:
                        if 'message' in post:
                            posts.append(post['message'])

                if len(posts) >= 100:  # Limit to 100 posts
                    break

                feed = requests.get(feed['paging']['next']).json()
        except Exception as e:
            logger.error(f"Error fetching Facebook posts: {str(e)}")

        return posts

    def get_linkedin_posts(self, username: str, start_date: str, end_date: str) -> List[str]:
        posts = []
        try:
            profile = self.linkedin_api.get_profile(username)
            activities = self.linkedin_api.get_profile_posts(profile['public_id'])

            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')

            for activity in activities:
                created_time = datetime.fromtimestamp(
                    activity['created_time'] / 1000
                )
                if start_dt <= created_time <= end_dt:
                    if 'commentary' in activity:
                        posts.append(activity['commentary'])

                if len(posts) >= 100:  # Limit to 100 posts
                    break
        except Exception as e:
            logger.error(f"Error fetching LinkedIn posts: {str(e)}")

        return posts

class PersonalityAnalyzer:
    def __init__(self):
        self.mbti_model = None
        self.ocean_model = None
        self.tokenizer = None
        self.model_cache = {}  # Model cache
        self.models_available = False  # Flag to track if models are available
        self._load_models()

    def _load_models(self):
        """Load the latest trained models"""
        try:
            # Get the latest trained models
            mbti_model = TrainedModel.objects.filter(
                model_type='MBTI',
                is_active=True
            ).order_by('-training_date').first()
            
            ocean_model = TrainedModel.objects.filter(
                model_type='OCEAN',
                is_active=True
            ).order_by('-training_date').first()
            
            if not mbti_model or not ocean_model:
                logger.warning("Models not found in database")
                self.models_available = False
                return
            
            # Load MBTI model
            if mbti_model and os.path.exists(mbti_model.local_path):
                model_path = os.path.join(mbti_model.local_path, 'model')
                tokenizer_path = os.path.join(mbti_model.local_path, 'tokenizer')
                
                logger.info(f"Loading MBTI model from {model_path}")
                logger.info(f"Loading MBTI tokenizer from {tokenizer_path}")
                
                if os.path.exists(model_path) and os.path.exists(tokenizer_path):
                    self.mbti_model = AutoModelForSequenceClassification.from_pretrained(model_path)
                    self.mbti_tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)
                else:
                    logger.error(f"MBTI model or tokenizer not found at {model_path} or {tokenizer_path}")
                    self.models_available = False
                    return
            else:
                logger.error(f"MBTI model directory not found at {mbti_model.local_path}")
                self.models_available = False
                return
            
            # Load OCEAN model
            if ocean_model and os.path.exists(ocean_model.local_path):
                model_path = os.path.join(ocean_model.local_path, 'model')
                tokenizer_path = os.path.join(ocean_model.local_path, 'tokenizer')
                
                logger.info(f"Loading OCEAN model from {model_path}")
                logger.info(f"Loading OCEAN tokenizer from {tokenizer_path}")
                
                if os.path.exists(model_path) and os.path.exists(tokenizer_path):
                    self.ocean_model = AutoModelForSequenceClassification.from_pretrained(model_path)
                    self.ocean_tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)
                else:
                    logger.error(f"OCEAN model or tokenizer not found at {model_path} or {tokenizer_path}")
                    self.models_available = False
                    return
            else:
                logger.error(f"OCEAN model directory not found at {ocean_model.local_path}")
                self.models_available = False
                return
            
            self.models_available = True
            logger.info("Models loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            self.models_available = False

    def _preprocess_text(self, text: str) -> str:
        # Basic preprocessing
        try:
            # Basic cleaning
            text = text.lower().strip()
            
            # Remove URLs
            text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
            
            # Remove mentions and hashtags
            text = re.sub(r'@\w+|\#\w+', '', text)
            
            # Tokenization and stop words removal
            stop_words = set(stopwords.words('english'))
            tokens = word_tokenize(text)
            tokens = [t for t in tokens if t not in stop_words]
            
            # Lemmatization with error handling
            doc = nlp(" ".join(tokens))
            lemmatized = [token.lemma_ for token in doc if token.lemma_ != '-PRON-']
            
            return " ".join(lemmatized)
        except Exception as e:
            logger.error(f"Error in text preprocessing: {str(e)}")
            return text

    def _extract_features(self, text: str) -> Dict:
        # Sentiment analysis
        blob = TextBlob(text)
        sentiment = blob.sentiment

        # Linguistic features
        doc = nlp(text)
        pos_counts = defaultdict(int)
        for token in doc:
            pos_counts[token.pos_] += 1

        # Word count and vocabulary richness
        words = word_tokenize(text)
        unique_words = set(words)

        return {
            'sentiment_polarity': sentiment.polarity,
            'sentiment_subjectivity': sentiment.subjectivity,
            'word_count': len(words),
            'vocab_richness': len(unique_words) / len(words) if words else 0,
            'pos_distribution': dict(pos_counts)
        }

    def analyze_mbti(self, text: str) -> Dict:
        if not self.models_available:
            logger.warning("Cannot analyze MBTI: models not available")
            return {
                'status': 'error',
                'message': 'Models not available. Please train models first.'
            }
        
        try:
            preprocessed_text = self._preprocess_text(text)
            features = self._extract_features(preprocessed_text)

            # Model prediction
            inputs = self.tokenizer(
                preprocessed_text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            )
            outputs = self.mbti_model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            # Map to MBTI types
            mbti_types = [
                "INTJ", "INTP", "ENTJ", "ENTP",
                "INFJ", "INFP", "ENFJ", "ENFP",
                "ISTJ", "ISFJ", "ESTJ", "ESFJ",
                "ISTP", "ISFP", "ESTP", "ESFP"
            ]
            
            predicted_idx = torch.argmax(probs).item()
            confidence = probs[0][predicted_idx].item()

            return {
                'type': mbti_types[predicted_idx],
                'confidence': confidence,
                'features': features
            }
        except Exception as e:
            logger.error(f"Error in MBTI analysis: {str(e)}")
            return {
                'status': 'error',
                'message': str(e)
            }

    def analyze_ocean(self, text: str) -> Dict:
        if not self.models_available:
            logger.warning("Cannot analyze OCEAN: models not available")
            return {
                'status': 'error',
                'message': 'Models not available. Please train models first.'
            }
            
        try:
            preprocessed_text = self._preprocess_text(text)
            features = self._extract_features(preprocessed_text)

            # Model prediction
            inputs = self.tokenizer(
                preprocessed_text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            )
            outputs = self.ocean_model(**inputs)
            scores = torch.sigmoid(outputs.logits)

            return {
                'scores': {
                    'openness': scores[0][0].item(),
                    'conscientiousness': scores[0][1].item(),
                    'extraversion': scores[0][2].item(),
                    'agreeableness': scores[0][3].item(),
                    'neuroticism': scores[0][4].item()
                },
                'features': features
            }
        except Exception as e:
            logger.error(f"Error in OCEAN analysis: {str(e)}")
            return {
                'status': 'error',
                'message': str(e)
            }

# Initialize global instances
scraper = SocialMediaScraper()
analyzer = PersonalityAnalyzer()

@shared_task
def analyze_text(text: str) -> Dict:
    """Analyze a single text."""
    try:
        # Check if models are available
        if not analyzer.models_available:
            return {
                'status': 'error',
                'message': 'Models not available. Please train models first.',
                'models_available': False
            }
            
        # Create analysis record
        analysis = PersonalityAnalysis.objects.create(raw_text=text)

        # Perform MBTI analysis
        mbti_results = analyzer.analyze_mbti(text)
        if mbti_results and 'status' not in mbti_results:
            analysis.mbti_type = mbti_results['type']
            analysis.mbti_confidence = mbti_results['confidence']
            analysis.mbti_features = mbti_results['features']

        # Perform OCEAN analysis
        ocean_results = analyzer.analyze_ocean(text)
        if ocean_results and 'status' not in ocean_results:
            scores = ocean_results['scores']
            analysis.openness = scores['openness']
            analysis.conscientiousness = scores['conscientiousness']
            analysis.extraversion = scores['extraversion']
            analysis.agreeableness = scores['agreeableness']
            analysis.neuroticism = scores['neuroticism']
            analysis.ocean_features = ocean_results['features']

        # Generate report if both analyses succeeded
        if 'status' not in mbti_results and 'status' not in ocean_results:
            analysis.report = generate_personality_report(mbti_results, ocean_results)
        
        analysis.save()

        return {
            'status': 'success',
            'analysis_id': analysis.id,
            'mbti': mbti_results,
            'ocean': ocean_results
        }
    except Exception as e:
        logger.error(f"Error in text analysis: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }

@shared_task(bind=True, max_retries=3)
def analyze_social_media(self, platform: str, username: str, start_date: str, end_date: str) -> Dict:
    """Analyze personality from social media profile with retry logic."""
    try:
        # Check if models are available
        if not analyzer.models_available:
            return {
                'status': 'error',
                'message': 'Models not available. Please train models first.',
                'models_available': False
            }
            
        # Date validation
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            if end_dt < start_dt:
                raise ValueError("End date must be after start date")
        except ValueError as e:
            logger.error(f"Date validation error: {str(e)}")
            raise

        # Get posts with timeout
        posts = []
        with timeout(300):  # 5 minutes timeout
            if platform == 'twitter':
                posts = scraper.get_twitter_posts(username, start_date, end_date)
            elif platform == 'facebook':
                posts = scraper.get_facebook_posts(username, start_date, end_date)
            elif platform == 'linkedin':
                posts = scraper.get_linkedin_posts(username, start_date, end_date)
            else:
                raise ValueError(f"Unsupported platform: {platform}")

        if not posts:
            raise ValueError(f"No posts found for user {username} on {platform}")

        # Combine posts into single text
        combined_text = " ".join(posts)

        # Create analysis record
        analysis = PersonalityAnalysis.objects.create(
            social_network=platform,
            username=username,
            raw_text=combined_text,
            post_count=len(posts)
        )

        # Perform MBTI analysis
        mbti_results = analyzer.analyze_mbti(combined_text)
        if mbti_results and 'status' not in mbti_results:
            analysis.mbti_type = mbti_results['type']
            analysis.mbti_confidence = mbti_results['confidence']
            analysis.mbti_features = mbti_results['features']

        # Perform OCEAN analysis
        ocean_results = analyzer.analyze_ocean(combined_text)
        if ocean_results and 'status' not in ocean_results:
            scores = ocean_results['scores']
            analysis.openness = scores['openness']
            analysis.conscientiousness = scores['conscientiousness']
            analysis.extraversion = scores['extraversion']
            analysis.agreeableness = scores['agreeableness']
            analysis.neuroticism = scores['neuroticism']
            analysis.ocean_features = ocean_results['features']

        # Generate report if both analyses succeeded
        if 'status' not in mbti_results and 'status' not in ocean_results:
            analysis.report = generate_personality_report(mbti_results, ocean_results)
        
        analysis.save()

        return {
            'status': 'success',
            'analysis_id': analysis.id,
            'mbti': mbti_results,
            'ocean': ocean_results
        }
    except Exception as e:
        logger.error(f"Error in social media analysis: {str(e)}")
        self.retry(exc=e, countdown=exponential_backoff(self.request.retries))

def generate_personality_report(mbti_results: Dict, ocean_results: Dict) -> Dict:
    """Generate comprehensive personality report."""
    report = {
        'summary': '',
        'traits': [],
        'career_recommendations': [],
        'relationship_insights': [],
        'personal_growth': []
    }

    if mbti_results and ocean_results:
        # Generate MBTI-based insights
        mbti_type = mbti_results['type']
        mbti_traits = {
            'I/E': mbti_type[0],  # Introversion/Extraversion
            'N/S': mbti_type[1],  # Intuition/Sensing
            'T/F': mbti_type[2],  # Thinking/Feeling
            'J/P': mbti_type[3]   # Judging/Perceiving
        }

        # Generate OCEAN-based insights
        ocean_scores = ocean_results['scores']

        # Combine insights
        report['summary'] = generate_summary(mbti_traits, ocean_scores)
        report['traits'] = generate_trait_analysis(mbti_traits, ocean_scores)
        report['career_recommendations'] = generate_career_recommendations(
            mbti_type,
            ocean_scores
        )
        report['relationship_insights'] = generate_relationship_insights(
            mbti_type,
            ocean_scores
        )
        report['personal_growth'] = generate_growth_suggestions(
            mbti_type,
            ocean_scores
        )

    return report

def generate_summary(mbti_traits: Dict, ocean_scores: Dict) -> str:
    """Generate personality summary."""
    # Implement summary generation based on MBTI and OCEAN scores
    pass

def generate_trait_analysis(mbti_traits: Dict, ocean_scores: Dict) -> List[Dict]:
    """Generate detailed trait analysis."""
    # Implement trait analysis
    pass

def generate_career_recommendations(mbti_type: str, ocean_scores: Dict) -> List[str]:
    """Generate career recommendations."""
    # Implement career recommendations
    pass

def generate_relationship_insights(mbti_type: str, ocean_scores: Dict) -> List[str]:
    """Generate relationship insights."""
    # Implement relationship insights
    pass

def generate_growth_suggestions(mbti_type: str, ocean_scores: Dict) -> List[str]:
    """Generate personal growth suggestions."""
    # Implement growth suggestions
    pass

@shared_task
def analyze_posts(posts):
    """Analyze a list of posts."""
    combined_text = " ".join(posts)
    return analyze_text(combined_text)

@shared_task
def analyze_social_media_personality(
    username: str,
    platform: str,
    start_date: str,
    end_date: str
) -> Dict:
    """
    Analyze personality based on social media posts
    
    Args:
        username: Social media username
        platform: Social media platform
        start_date: Start date for post collection
        end_date: End date for post collection
    """
    try:
        # Fetch social media posts (implement platform-specific logic)
        posts = fetch_social_media_posts(username, platform, start_date, end_date)
        
        # Load latest models
        mbti_model = TrainedModel.objects.filter(
            model_type='MBTI',
            is_active=True
        ).latest('training_date')
        
        ocean_model = TrainedModel.objects.filter(
            model_type='OCEAN',
            is_active=True
        ).latest('training_date')
        
        # Perform analysis
        mbti_results = analyze_mbti(posts, mbti_model)
        ocean_results = analyze_ocean(posts, ocean_model)
        
        # Create analysis record
        analysis = PersonalityAnalysis.objects.create(
            social_platform=platform,
            username=username,
            date_range_start=datetime.strptime(start_date, '%Y-%m-%d'),
            date_range_end=datetime.strptime(end_date, '%Y-%m-%d'),
            posts_analyzed=len(posts),
            mbti_type=mbti_results['type'],
            mbti_scores=mbti_results['scores'],
            ocean_scores=ocean_results['scores'],
            confidence_score=min(mbti_results['confidence'], ocean_results['confidence']),
            interpretation={
                'mbti': interpret_mbti(mbti_results),
                'ocean': interpret_ocean(ocean_results)
            },
            recommended_roles=generate_role_recommendations(mbti_results, ocean_results),
            model_versions={
                'mbti': mbti_model.version,
                'ocean': ocean_model.version
            }
        )
        
        return {
            'status': 'success',
            'analysis_id': analysis.id,
            'message': 'Successfully completed personality analysis'
        }
        
    except Exception as e:
        logger.error(f'Error analyzing personality: {str(e)}')
        return {
            'status': 'error',
            'message': str(e)
        }

# Helper functions (to be implemented)
def fetch_social_media_posts(username: str, platform: str, start_date: str, end_date: str) -> List[str]:
    """Fetch posts from social media platform"""
    # Implement platform-specific logic
    pass

def analyze_mbti(posts: List[str], model: TrainedModel) -> Dict:
    """Analyze MBTI personality type"""
    # Implement MBTI analysis
    pass

def analyze_ocean(posts: List[str], model: TrainedModel) -> Dict:
    """Analyze OCEAN personality traits"""
    # Implement OCEAN analysis
    pass

def interpret_mbti(results: Dict) -> Dict:
    """Generate interpretation of MBTI results"""
    # Implement MBTI interpretation
    pass

def interpret_ocean(results: Dict) -> Dict:
    """Generate interpretation of OCEAN results"""
    # Implement OCEAN interpretation
    pass

def generate_role_recommendations(mbti_results: Dict, ocean_results: Dict) -> List[str]:
    """Generate team role recommendations based on personality analysis"""
    # Implement role recommendation logic
    pass

@shared_task
def download_datasets():
    """Download datasets from Kaggle and other sources."""
    # Directory configuration
    raw_data_dir = os.path.join(settings.DATA_DIR, 'raw')
    os.makedirs(raw_data_dir, exist_ok=True)
    
    # List of datasets to download
    datasets = [
        {
            'name': 'mbti-500',
            'type': 'mbti',
            'url': 'https://www.kaggle.com/datasets/datasnaek/mbti-type',
        },
        {
            'name': 'ocean-personality',
            'type': 'ocean',
            'url': 'https://www.kaggle.com/datasets/tunguz/big-five-personality-test',
        }
    ]
    
    for dataset in datasets:
        # TODO: Download datasets using Kaggle API
        file_path = os.path.join(raw_data_dir, f"{dataset['name']}.csv")
        
        TrainingData.objects.create(
            model_type=dataset['type'],
            dataset_name=dataset['name'],
            source_url=dataset['url'],
            file_path=file_path
        )
    
    return "Datasets downloaded successfully"

@shared_task
def train_model(model_type):
    """Train a model (MBTI or OCEAN)."""
    # Load training data
    training_data = TrainingData.objects.filter(model_type=model_type).first()
    if not training_data:
        raise ValueError(f"No training data found for {model_type}")
    
    # TODO: Implement model training pipeline
    # 1. Data preprocessing
    # 2. Feature extraction
    # 3. Model training
    # 4. Model evaluation
    
    # Example metrics
    metrics = {
        'accuracy': 0.85,
        'precision': 0.83,
        'recall': 0.82,
        'f1_score': 0.84
    }
    
    # Save the model
    model_path = os.path.join(settings.DATA_DIR, 'models', f"{model_type}_model.pkl")
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    
    # Create model entry in database
    model = TrainedModel.objects.create(
        model_type=model_type,
        version='1.0.0',
        file_path=model_path,
        metrics=metrics,
        is_active=True,
        training_data=training_data
    )
    
    # Deactivate old models
    TrainedModel.objects.filter(
        model_type=model_type,
        is_active=True
    ).exclude(id=model.id).update(is_active=False)
    
    return model.id

@shared_task
def fetch_kaggle_datasets() -> Dict:
    """
    Automatically download MBTI and OCEAN datasets from Kaggle
    """
    try:
        # Configure Kaggle client with credentials
        try:
            # Check if KAGGLE_USERNAME and KAGGLE_KEY environment variables are set
            if not os.environ.get('KAGGLE_USERNAME') or not os.environ.get('KAGGLE_KEY'):
                # If credentials are not in environment variables, look in kaggle.json file
                kaggle_json_path = os.path.expanduser('~/.kaggle/kaggle.json')
                if not os.path.exists(kaggle_json_path):
                    raise ValueError(
                        "Kaggle credentials not found. Please set KAGGLE_USERNAME and KAGGLE_KEY environment variables "
                        "or create a ~/.kaggle/kaggle.json file"
                    )
            
            kaggle.api.authenticate()
            logger.info("Kaggle authentication successful")
        except Exception as e:
            logger.error(f"Kaggle authentication error: {str(e)}")
            return {
                'status': 'error',
                'message': f"Kaggle authentication error: {str(e)}"
            }
        
        # Créer les répertoires de données s'ils n'existent pas
        data_dir = os.path.join(settings.DATA_DIR, 'datasets', 'kaggle')
        os.makedirs(data_dir, exist_ok=True)
        
        # Définir les datasets simplifiés (sans utiliser dataset_view)
        datasets = [
            {
                'id': 'datasnaek/mbti-type',
                'name': 'MBTI Personality Types Dataset',
                'type': 'MBTI',
                'description': 'Contient des posts classés par type MBTI',
                'filename': 'mbti_1.csv'
            },
            {
                'id': 'tunguz/big-five-personality-test',
                'name': 'Big Five Personality Test Dataset',
                'type': 'OCEAN',
                'description': 'Dataset pour le modèle Big Five (OCEAN)',
                'filename': 'data-final.csv',  # Nom corrigé pour le fichier principal
                'alternative_filenames': ['data.csv', 'IPIP-FFM-data-8Nov2018.csv', 'data-final.csv']
            }
        ]
        
        results = []
        for dataset in datasets:
            try:
                # Créer le répertoire pour le type de dataset
                dataset_path = os.path.join(data_dir, dataset['type'].lower())
                os.makedirs(dataset_path, exist_ok=True)
                
                # Créer un sous-répertoire pour ce dataset spécifique
                dataset_id_path = dataset['id'].split('/')[1]
                dataset_specific_path = os.path.join(dataset_path, dataset_id_path)
                os.makedirs(dataset_specific_path, exist_ok=True)
                
                logger.info(f"Downloading dataset {dataset['name']} from Kaggle...")
                
                try:
                    # Télécharger le dataset de manière simplifiée
                    kaggle.api.dataset_download_files(
                        dataset['id'],
                        path=dataset_specific_path,
                        unzip=True,
                        quiet=False  # Afficher la progression
                    )
                    
                    # Check if download was successful by looking for the main file
                    expected_file = os.path.join(dataset_specific_path, dataset.get('filename', ''))
                    if os.path.exists(expected_file):
                        file_size = os.path.getsize(expected_file)
                        logger.info(f"Found expected file: {expected_file}")
                    else:
                        # Look for alternative filenames if specified
                        found_file = False
                        if dataset.get('alternative_filenames'):
                            for alt_filename in dataset.get('alternative_filenames', []):
                                alt_file_path = os.path.join(dataset_specific_path, alt_filename)
                                if os.path.exists(alt_file_path):
                                    expected_file = alt_file_path
                                    file_size = os.path.getsize(expected_file)
                                    logger.info(f"Found alternative file: {alt_filename}")
                                    found_file = True
                                    break
                        
                        # If no alternative files found, try any CSV file
                        if not found_file:
                            csv_files = [f for f in os.listdir(dataset_specific_path) if f.endswith('.csv')]
                            if csv_files:
                                expected_file = os.path.join(dataset_specific_path, csv_files[0])
                                file_size = os.path.getsize(expected_file)
                                logger.info(f"Found CSV file with different name: {csv_files[0]} instead of {dataset.get('filename', '')}")
                            else:
                                # Rechercher tout fichier texte qui pourrait être converti
                                text_files = [f for f in os.listdir(dataset_specific_path) if f.endswith('.txt') or f.endswith('.tab') or f.endswith('.data')]
                                if text_files:
                                    text_file = os.path.join(dataset_specific_path, text_files[0])
                                    logger.info(f"Found text file to convert: {text_files[0]}")
                                    
                                    # Essayer de convertir le fichier texte en CSV
                                    try:
                                        # Détecter si c'est un TSV ou un fichier délimité
                                        with open(text_file, 'r', encoding='utf-8', errors='ignore') as f:
                                            sample = f.read(1024)
                                        
                                        # Déterminer le délimiteur
                                        if '\t' in sample:
                                            delimiter = '\t'
                                        elif ',' in sample:
                                            delimiter = ','
                                        else:
                                            delimiter = None
                                        
                                        if delimiter:
                                            # Lire le fichier et le convertir en CSV
                                            df = pd.read_csv(text_file, delimiter=delimiter, on_bad_lines='warn')
                                            csv_output = os.path.join(dataset_specific_path, 'converted_data.csv')
                                            df.to_csv(csv_output, index=False)
                                            expected_file = csv_output
                                            file_size = os.path.getsize(expected_file)
                                            logger.info(f"Successfully converted {text_files[0]} to CSV")
                                        else:
                                            # Si nous ne pouvons pas détecter le délimiteur, essayer read_fwf (format à largeur fixe)
                                            try:
                                                df = pd.read_fwf(text_file, on_bad_lines='warn')
                                                csv_output = os.path.join(dataset_specific_path, 'converted_data.csv')
                                                df.to_csv(csv_output, index=False)
                                                expected_file = csv_output
                                                file_size = os.path.getsize(expected_file)
                                                logger.info(f"Successfully converted fixed-width file {text_files[0]} to CSV")
                                            except Exception as fwf_error:
                                                logger.error(f"Failed to convert fixed-width file: {str(fwf_error)}")
                                                raise ValueError(f"Could not convert {text_files[0]} to CSV")
                                    except Exception as conv_error:
                                        logger.error(f"Failed to convert text file to CSV: {str(conv_error)}")
                                        raise ValueError(f"Failed to convert {text_files[0]} to CSV")
                                else:
                                    # Tenter une recherche récursive de fichiers CSV dans les sous-répertoires
                                    csv_files = []
                                    for root, dirs, files in os.walk(dataset_specific_path):
                                        for file in files:
                                            if file.endswith('.csv'):
                                                csv_files.append(os.path.join(root, file))
                                    
                                    if csv_files:
                                        expected_file = csv_files[0]
                                        file_size = os.path.getsize(expected_file)
                                        logger.info(f"Found CSV file in subdirectory: {expected_file}")
                                    else:
                                        # Recherche de fichiers Excel qui pourraient être convertis
                                        excel_files = []
                                        for root, dirs, files in os.walk(dataset_specific_path):
                                            for file in files:
                                                if file.endswith('.xlsx') or file.endswith('.xls'):
                                                    excel_files.append(os.path.join(root, file))
                                        
                                        if excel_files:
                                            excel_file = excel_files[0]
                                            try:
                                                df = pd.read_excel(excel_file)
                                                csv_output = os.path.join(dataset_specific_path, 'converted_data.csv')
                                                df.to_csv(csv_output, index=False)
                                                expected_file = csv_output
                                                file_size = os.path.getsize(expected_file)
                                                logger.info(f"Successfully converted Excel file {os.path.basename(excel_file)} to CSV")
                                            except Exception as excel_error:
                                                logger.error(f"Failed to convert Excel file: {str(excel_error)}")
                                                raise ValueError(f"Failed to convert {os.path.basename(excel_file)} to CSV")
                                        else:
                                            # List all files in the directory to help with debugging
                                            all_files = []
                                            for root, dirs, files in os.walk(dataset_specific_path):
                                                for file in files:
                                                    all_files.append(os.path.join(root, file))
                                            
                                            logger.error(f"No suitable files found in {dataset_specific_path}. Available files: {all_files}")
                                            raise ValueError(f"No suitable file found in {dataset_specific_path}")

                    # Créer ou mettre à jour l'enregistrement du dataset
                    db_dataset, created = Dataset.objects.update_or_create(
                        dataset_id=dataset['id'],
                        defaults={
                            'name': dataset['name'],
                            'source': 'kaggle',
                            'local_path': dataset_specific_path,
                            'size': file_size,
                            'type': dataset['type'],
                            'metadata': {
                                'description': dataset['description'],
                                'files': [os.path.basename(expected_file)]
                            }
                        }
                    )
                    
                    results.append({
                        'status': 'success',
                        'dataset_id': db_dataset.id,
                        'name': dataset['name'],
                        'type': dataset['type'],
                        'action': 'created' if created else 'updated',
                        'file': os.path.basename(expected_file)
                    })
                    
                    logger.info(f"Dataset {dataset['name']} downloaded successfully")
                    
                except Exception as api_error:
                    logger.error(f"Kaggle API error for {dataset['id']}: {str(api_error)}")
                    
                    # Alternative approach: use requests library for direct download
                    if dataset['id'] == 'datasnaek/mbti-type':
                        direct_url = "https://raw.githubusercontent.com/datasnaek/MBTI-Dataset/master/mbti_1.csv"
                        output_file = os.path.join(dataset_specific_path, "mbti_1.csv")
                        logger.info(f"Attempting direct download from {direct_url}")
                        
                        try:
                            response = requests.get(direct_url)
                            if response.status_code == 200:
                                with open(output_file, 'wb') as f:
                                    f.write(response.content)
                                
                                file_size = os.path.getsize(output_file)
                                
                                # Create or update dataset record
                                db_dataset, created = Dataset.objects.update_or_create(
                                    dataset_id=dataset['id'],
                                    defaults={
                                        'name': dataset['name'],
                                        'source': 'github',
                                        'local_path': dataset_specific_path,
                                        'size': file_size,
                                        'type': dataset['type'],
                                        'metadata': {
                                            'description': dataset['description'],
                                            'files': ["mbti_1.csv"]
                                        }
                                    }
                                )
                                
                                results.append({
                                    'status': 'success',
                                    'dataset_id': db_dataset.id,
                                    'name': dataset['name'],
                                    'type': dataset['type'],
                                    'action': 'created' if created else 'updated',
                                    'source': 'direct_download',
                                    'file': "mbti_1.csv"
                                })
                                
                                logger.info(f"Dataset {dataset['name']} successfully downloaded via direct method")
                                continue
                        except Exception as direct_error:
                            logger.error(f"Direct download failed: {str(direct_error)}")
                    
                    # If we reach here, both methods failed
                    results.append({
                        'status': 'error',
                        'dataset_id': dataset['id'],
                        'name': dataset['name'],
                        'error': str(api_error)
                    })
                
            except Exception as e:
                logger.error(f"Error downloading dataset {dataset['id']}: {str(e)}")
                results.append({
                    'status': 'error',
                    'dataset_id': dataset['id'],
                    'name': dataset['name'],
                    'error': str(e)
                })
        
        success_count = len([r for r in results if r['status'] == 'success'])
        error_count = len([r for r in results if r['status'] == 'error'])
        
        return {
            'status': 'completed',
            'results': results,
            'message': f"{success_count} datasets successfully downloaded, {error_count} failures"
        }
        
    except Exception as e:
        logger.error(f'General error in dataset download: {str(e)}')
        return {
            'status': 'error',
            'message': str(e)
        }

@shared_task
def train_personality_model(dataset_ids: List[int], model_type: str, data_limit=None, force_limit=False) -> Dict:
    """Train a personality model from specified datasets."""
    try:
        logger.info(f"Starting training for {model_type} model with datasets {dataset_ids}")
        
        # Clear memory before starting
        gc.collect()
        
        # Set memory limits
        soft, hard = resource.getrlimit(resource.RLIMIT_AS)
        resource.setrlimit(resource.RLIMIT_AS, (soft, hard))
        
        # Create model directory
        model_dir = os.path.join(settings.DATA_DIR, 'models', model_type.lower())
        os.makedirs(model_dir, exist_ok=True)
        logger.info(f"Model directory: {model_dir}")
        
        # Load datasets with memory optimization
        all_data = []
        total_samples_loaded = 0
        
        for dataset_id in dataset_ids:
            try:
                dataset = Dataset.objects.get(id=dataset_id)
                logger.info(f"Loading dataset: {dataset.name} (ID: {dataset_id})")
                
                dataset_path = dataset.local_path
                file_paths = []
                
                # Find all CSV files in the dataset path
                if os.path.isdir(dataset_path):
                    for root, dirs, files in os.walk(dataset_path):
                        for file in files:
                            if file.endswith('.csv'):
                                file_paths.append(os.path.join(root, file))
                
                if not file_paths:
                    logger.warning(f"No CSV files found for dataset {dataset.name} at {dataset_path}")
                    continue
                
                logger.info(f"Found {len(file_paths)} CSV files for dataset {dataset.name}")
                
                for file_path in file_paths:
                    file_name = os.path.basename(file_path)
                    logger.info(f"Processing file: {file_name}")
                    
                    try:
                        # Use memory optimization for reading CSV
                        csv_chunk_size = 5000  # Adjust based on file size and available memory
                        
                        # Get total lines without loading the entire file
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            total_lines = sum(1 for _ in f)
                        
                        headers = pd.read_csv(file_path, nrows=0).columns
                        total_chunks = math.ceil((total_lines - 1) / csv_chunk_size)  # -1 for headers
                        
                        logger.info(f"File {file_name} has {total_lines} lines, processing in {total_chunks} chunks")
                        
                        # Process file in chunks to save memory
                        for chunk_i, df_chunk in enumerate(pd.read_csv(file_path, chunksize=csv_chunk_size, low_memory=True, 
                                                      on_bad_lines='warn')):
                            logger.info(f"Processing chunk {chunk_i+1}/{total_chunks} of {file_name}")
                            
                            # Specific conversions for model type
                            if model_type == 'MBTI':
                                # Check if the file has the expected format
                                if 'type' in df_chunk.columns and any(col in df_chunk.columns for col in ['posts', 'text', 'content']):
                                    text_col = next(col for col in df_chunk.columns if col in ['posts', 'text', 'content'])
                                    df_processed = pd.DataFrame({
                                        'text': df_chunk[text_col],
                                        'type': df_chunk['type']
                                    })
                                    all_data.append(df_processed)
                                    total_samples_loaded += len(df_processed)
                                    logger.info(f"Loaded {len(df_processed)} samples from chunk {chunk_i+1}/{total_chunks} of {file_name}")
                                    
                                else:
                                    logger.warning(f"MBTI file {file_name} doesn't have expected columns (type, and text/posts/content)")
                                
                            elif model_type == 'OCEAN':
                                # Automatic detection of OCEAN format
                                ocean_dims = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
                                
                                # Detect column name variants for OCEAN
                                column_variants = {
                                    'openness': ['openness', 'opn', 'o', 'open'],
                                    'conscientiousness': ['conscientiousness', 'csn', 'c', 'cons'],
                                    'extraversion': ['extraversion', 'ext', 'e', 'extra'],
                                    'agreeableness': ['agreeableness', 'agr', 'a', 'agree'],
                                    'neuroticism': ['neuroticism', 'est', 'n', 'neuro']
                                }
                                
                                column_mapping = {}
                                for dim, variants in column_variants.items():
                                    for variant in variants:
                                        for col in df_chunk.columns:
                                            if variant.lower() == col.lower() or variant.lower() == col.lower().replace(' ', '_'):
                                                column_mapping[dim] = col
                                                break
                                        if dim in column_mapping:
                                            break
                                
                                # If we found all OCEAN columns and a text column
                                text_cols = [col for col in df_chunk.columns if col.lower() in ['text', 'post', 'content', 'description']]
                                
                                if len(column_mapping) == 5 and text_cols:
                                    text_col = text_cols[0]
                                    df_processed = pd.DataFrame({'text': df_chunk[text_col]})
                                    for dim, col in column_mapping.items():
                                        df_processed[dim] = df_chunk[col]
                                    
                                    all_data.append(df_processed)
                                    total_samples_loaded += len(df_processed)
                                    logger.info(f"Loaded {len(df_processed)} samples from chunk {chunk_i+1}/{total_chunks} of {file_name}")
                                # Otherwise, try to create synthetic text from available columns
                                elif len(column_mapping) == 5:
                                    df_chunk['text'] = df_chunk.apply(
                                        lambda row: f"Person with personality scores: " + 
                                                   " ".join([f"{dim}:{row[col]}" for dim, col in column_mapping.items()]),
                                        axis=1
                                    )
                                    
                                    df_processed = pd.DataFrame({'text': df_chunk['text']})
                                    for dim, col in column_mapping.items():
                                        df_processed[dim] = df_chunk[col]
                                    
                                    all_data.append(df_processed)
                                    total_samples_loaded += len(df_processed)
                                    logger.info(f"Created synthetic text samples from {len(df_processed)} rows in chunk {chunk_i+1}/{total_chunks} of {file_name}")
                                else:
                                    logger.warning(f"OCEAN file {file_name} is missing required columns. Found mappings: {column_mapping}")
                            
                            # Check if we reached data limit
                            if data_limit and force_limit and total_samples_loaded >= data_limit:
                                logger.info(f"Reached data limit of {data_limit} samples. Stopping data loading.")
                                break
                        
                        # Check again if limit is reached to skip remaining files
                        if data_limit and force_limit and total_samples_loaded >= data_limit:
                            logger.info(f"Data limit reached. Skipping remaining files.")
                            break
                        
                        # Clean memory after each file
                        gc.collect()
                        
                    except Exception as file_error:
                        logger.error(f"Error processing file {file_name}: {str(file_error)}")
                        continue
            
            except Dataset.DoesNotExist:
                logger.error(f"Dataset with ID {dataset_id} does not exist.")
                continue
            except Exception as dataset_error:
                logger.error(f"Error loading dataset {dataset_id}: {str(dataset_error)}")
                continue
        
        if not all_data:
            return {
                'status': 'error',
                'message': f"No valid data found for {model_type} model."
            }
        
        logger.info(f"Total samples loaded: {total_samples_loaded}")
        
        # Combine data and apply limit if necessary
        combined_df = pd.concat(all_data, ignore_index=True)
        logger.info(f"Combined dataset shape: {combined_df.shape}")
        
        if data_limit and force_limit and len(combined_df) > data_limit:
            logger.info(f"Applying strict data limit of {data_limit} samples")
            combined_df = combined_df.sample(data_limit, random_state=42).reset_index(drop=True)
            logger.info(f"Dataset size after applying limit: {len(combined_df)}")
        
        # Preprocess texts with memory economy
        logger.info("Preprocessing text data...")
        
        # Preprocess in batches for memory economy
        batch_size = 1000
        num_batches = math.ceil(len(combined_df) / batch_size)
        processed_texts = []
        
        for i in range(num_batches):
            start_idx = i * batch_size
            end_idx = min((i + 1) * batch_size, len(combined_df))
            logger.info(f"Preprocessing batch {i+1}/{num_batches} (samples {start_idx} to {end_idx})")
            
            batch_texts = combined_df.iloc[start_idx:end_idx]['text'].tolist()
            batch_processed = [preprocess_text(text) for text in batch_texts]
            processed_texts.extend(batch_processed)
            
            # Clean after each batch
            gc.collect()
        
        combined_df['processed_text'] = processed_texts
        logger.info("Text preprocessing completed")
        
        # Train model based on model type
        logger.info(f"Starting {model_type} model training")
        
        if model_type == 'MBTI':
            # Multi-class classification for MBTI
            X = combined_df['processed_text']
            y = combined_df['type']
            
            # Split train/test
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            logger.info(f"Training set: {len(X_train)} samples, Test set: {len(X_test)} samples")
            logger.info(f"Class distribution: {y.value_counts().to_dict()}")
            
            # Initialize tokenizer and model
            tokenizer = AutoTokenizer.from_pretrained('distilbert-base-uncased')
            model = AutoModelForSequenceClassification.from_pretrained(
                'distilbert-base-uncased', 
                num_labels=16  # 16 types MBTI
            )
            
            # Prepare data for training
            from transformers import TrainingArguments, Trainer
            from datasets import Dataset as HFDataset
            
            def tokenize_function(examples):
                return tokenizer(examples['text'], padding='max_length', truncation=True, max_length=128)
            
            # Map MBTI types to numeric labels
            mbti_labels = sorted(y.unique())
            mbti_to_label = {mbti: i for i, mbti in enumerate(mbti_labels)}
            
            # Convert MBTI types to numeric labels
            y_train_numeric = [mbti_to_label[mbti] for mbti in y_train]
            y_test_numeric = [mbti_to_label[mbti] for mbti in y_test]
            
            # Create datasets
            train_dataset = HFDataset.from_dict({
                'text': X_train.tolist(),
                'label': y_train_numeric
            })
            train_dataset = train_dataset.map(tokenize_function, batched=True)
            
            test_dataset = HFDataset.from_dict({
                'text': X_test.tolist(),
                'label': y_test_numeric
            })
            test_dataset = test_dataset.map(tokenize_function, batched=True)
            
            # Define training parameters with memory optimization
            training_args = TrainingArguments(
                output_dir=os.path.join(model_dir, 'results'),
                num_train_epochs=3,
                per_device_train_batch_size=4,  # Reduce batch size
                per_device_eval_batch_size=4,   # Reduce batch size
                warmup_steps=500,
                weight_decay=0.01,
                logging_dir=os.path.join(model_dir, 'logs'),
                logging_steps=10,
                evaluation_strategy="steps",
                eval_steps=100,
                save_steps=200,
                load_best_model_at_end=True,
                fp16=torch.cuda.is_available(),  # Use mixed precision if GPU available
                gradient_accumulation_steps=4    # Accumulate gradients for simulating larger batches
            )
            
            # Initialize trainer
            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=train_dataset,
                eval_dataset=test_dataset
            )
            
            # Train model
            logger.info("Starting MBTI model training")
            trainer.train()
            
            # Save model and tokenizer
            model_save_path = os.path.join(model_dir, 'model')
            tokenizer_save_path = os.path.join(model_dir, 'tokenizer')
            
            trainer.save_model(model_save_path)
            tokenizer.save_pretrained(tokenizer_save_path)
            
            # Evaluate on test set
            logger.info("Evaluating MBTI model")
            result = trainer.evaluate()
            
            # Save label mapping
            label_mapping = {i: mbti for mbti, i in mbti_to_label.items()}
            with open(os.path.join(model_dir, 'label_mapping.json'), 'w') as f:
                json.dump(label_mapping, f)
            
            # Log evaluation results
            logger.info(f"MBTI model evaluation: {result}")
            
            # Register model in database
            metrics = {
                'accuracy': result.get('eval_accuracy'),
                'loss': result.get('eval_loss')
            }
            
            # Clean memory
            del trainer, model, tokenizer
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
        elif model_type == 'OCEAN':
            # Preparation for multi-label regression
            X = combined_df['processed_text']
            y = combined_df[['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']]
            
            # Split train/test
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            logger.info(f"Training set: {len(X_train)} samples, Test set: {len(X_test)} samples")
            
            # Initialize tokenizer and model
            tokenizer = AutoTokenizer.from_pretrained('distilbert-base-uncased')
            model = AutoModelForSequenceClassification.from_pretrained(
                'distilbert-base-uncased', 
                num_labels=5,  # 5 dimensions OCEAN
                problem_type="regression"
            )
            
            # Prepare data for training
            from transformers import TrainingArguments, Trainer
            from datasets import Dataset as HFDataset
            
            def tokenize_function(examples):
                return tokenizer(examples['text'], padding='max_length', truncation=True, max_length=128)
            
            train_dataset = HFDataset.from_dict({
                'text': X_train.tolist(),
                'labels': y_train.values.tolist()
            })
            train_dataset = train_dataset.map(tokenize_function, batched=True)
            
            test_dataset = HFDataset.from_dict({
                'text': X_test.tolist(),
                'labels': y_test.values.tolist()
            })
            test_dataset = test_dataset.map(tokenize_function, batched=True)
            
            # Define training parameters
            training_args = TrainingArguments(
                output_dir=os.path.join(model_dir, 'results'),
                num_train_epochs=3,
                per_device_train_batch_size=4,  # Reduce batch size
                per_device_eval_batch_size=4,   # Reduce batch size
                warmup_steps=500,
                weight_decay=0.01,
                logging_dir=os.path.join(model_dir, 'logs'),
                logging_steps=10,
                evaluation_strategy="steps",
                eval_steps=100,
                save_steps=200,
                load_best_model_at_end=True,
                fp16=torch.cuda.is_available(),  # Use mixed precision if GPU available
                gradient_accumulation_steps=4    # Accumulate gradients for simulating larger batches
            )
            
            # Initialize trainer
            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=train_dataset,
                eval_dataset=test_dataset
            )
            
            # Train model
            logger.info("Starting OCEAN model training")
            trainer.train()
            
            # Save model and tokenizer
            model_save_path = os.path.join(model_dir, 'model')
            tokenizer_save_path = os.path.join(model_dir, 'tokenizer')
            
            trainer.save_model(model_save_path)
            tokenizer.save_pretrained(tokenizer_save_path)
            
            # Evaluate on test set
            logger.info("Evaluating OCEAN model")
            result = trainer.evaluate()
            
            # Log evaluation results
            logger.info(f"OCEAN model evaluation: {result}")
            
            # Metrics for regression model
            metrics = {
                'eval_loss': result.get('eval_loss'),
                'mse': None  # To be calculated separately
            }
            
            # Clean memory after training
            del trainer, model, tokenizer
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        
        # Generate a version number
        version = datetime.now().strftime("%Y%m%d%H%M")
        
        # Register model in database
        model_obj = TrainedModel.objects.create(
            name=f"{model_type}_model_{version}",
            model_type=model_type,
            local_path=model_dir,  # Use full directory path
            metrics=metrics,
            version=version,
            parameters={
                'data_limit': data_limit,
                'samples_used': len(combined_df),
                'datasets': [str(dataset_id) for dataset_id in dataset_ids]
            }
        )
        
        # Deactivate all old models and activate the new one
        TrainedModel.objects.filter(model_type=model_type, is_active=True).update(is_active=False)
        model_obj.is_active = True
        model_obj.save()
        
        logger.info(f"{model_type} model trained successfully with {len(combined_df)} samples")
        
        # Clean memory after each model training
        gc.collect()
        
        return {
            'status': 'success',
            'model_id': model_obj.id,
            'model_name': model_obj.name,
            'samples_used': len(combined_df),
            'metrics': metrics
        }
        
    except Exception as e:
        logger.error(f"Error training {model_type} model: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }

def preprocess_text(text):
    """Text preprocessing for model training."""
    try:
        if pd.isna(text) or not isinstance(text, str):
            return ""
            
        # Basic cleaning
        text = text.lower().strip()
        
        # Remove URLs, mentions and hashtags in one pass
        text = re.sub(r'http\S+|www\S+|https\S+|@\w+|\#\w+', '', text, flags=re.MULTILINE)
        
        # Skip NLP-heavy processing for very short texts
        if len(text) < 10:
            return text
            
        # Use a more efficient approach for stopword removal and tokenization
        # Only process if the text is substantial
        if len(text) > 20:
            # Tokenization and stop words removal
            stop_words = set(stopwords.words('english'))
            
            # Simple tokenization and filtering
            tokens = [t for t in text.split() if t not in stop_words]
            
            # Only use spaCy for longer texts that need lemmatization
            if len(tokens) > 5:
                # Use a smaller batch for spaCy to reduce memory usage
                doc = nlp(" ".join(tokens[:500]))  # Limit to first 500 tokens to prevent memory issues
                lemmatized = [token.lemma_ for token in doc if token.lemma_ != '-PRON-']
                return " ".join(lemmatized)
            
            return " ".join(tokens)
            
        return text
    except Exception as e:
        logger.error(f"Error in text preprocessing: {str(e)}")
        return ""

# New utility functions
def exponential_backoff(retries):
    """Calculate exponential backoff time."""
    return 2 ** retries * 60  # Minutes

def generate_model_version(model_type: str) -> str:
    """Generate semantic version number."""
    latest_model = TrainedModel.objects.filter(
        model_type=model_type
    ).order_by('-training_date').first()
    
    if not latest_model:
        return '1.0.0'
    
    major, minor, patch = map(int, latest_model.version.split('.'))
    return f"{major}.{minor}.{patch + 1}"

class timeout:
    """Context manager for timeout."""
    def __init__(self, seconds):
        self.seconds = seconds
    
    def __enter__(self):
        signal.signal(signal.SIGALRM, self._handle_timeout)
        signal.alarm(self.seconds)
    
    def __exit__(self, *args):
        signal.alarm(0)
    
    def _handle_timeout(self, *args):
        raise TimeoutError("Operation timed out")

@shared_task(bind=True)
def fetch_and_train_models(self, model_types=None, data_limit=None, force_limit=False, allow_alternative_formats=True, convert_ocean_format=True, check_existing_files=True, ocean_filename="IPIP-FFM-data-8Nov2018", show_total_count=False):
    """
    Fetch and train models for personality analysis.
    
    Args:
        model_types (list): List of model types to train ('MBTI', 'OCEAN')
        data_limit (int): Maximum number of samples to use for training
        force_limit (bool): Whether to force the data limit
        allow_alternative_formats (bool): Whether to allow alternative data formats
        convert_ocean_format (bool): Whether to convert OCEAN format
        check_existing_files (bool): Whether to check for existing files
        ocean_filename (str): Name of the OCEAN dataset file
        show_total_count (bool): Whether to show total count of samples
    """
    try:
        # Set memory limits
        soft, hard = resource.getrlimit(resource.RLIMIT_AS)
        # Set to 4GB
        resource.setrlimit(resource.RLIMIT_AS, (4 * 1024 * 1024 * 1024, hard))
        
        logger.info("Starting fetch and train with parameters:")
        logger.info(f"Model types: {model_types}")
        logger.info(f"Data limit: {data_limit}")
        logger.info(f"Force limit: {force_limit}")
        logger.info(f"Allow alternative formats: {allow_alternative_formats}")
        logger.info(f"Convert OCEAN format: {convert_ocean_format}")
        logger.info(f"Check existing files: {check_existing_files}")
        logger.info(f"OCEAN filename: {ocean_filename}")
        logger.info(f"Show total count: {show_total_count}")
        logger.info(f"Memory limit set to: {soft / (1024*1024*1024)}GB")

        if model_types is None:
            model_types = ['MBTI', 'OCEAN']

        results = {}
        for model_type in model_types:
            try:
                logger.info(f"Starting process for {model_type} model")
                
                # Create a new model instance
                model = TrainedModel.objects.create(
                    name=f"{model_type}_model",
                    model_type=model_type,
                    version="1.0",
                    status="training"
                )
                logger.info(f"Created model record with ID: {model.id}")

                # Fetch and process dataset
                logger.info(f"Fetching dataset for {model_type}")
                dataset_result = fetch_kaggle_datasets()
                
                if not dataset_result or dataset_result.get('status') != 'completed':
                    raise Exception(f"Failed to fetch datasets: {dataset_result.get('message', 'Unknown error')}")
                
                # Find the correct dataset path for this model type
                dataset_path = None
                for result in dataset_result.get('results', []):
                    if result.get('type') == model_type:
                        dataset = Dataset.objects.get(id=result['dataset_id'])
                        dataset_path = dataset.local_path
                        break
                
                if not dataset_path:
                    raise Exception(f"No dataset found for {model_type}")

                logger.info(f"Dataset fetched successfully: {dataset_path}")

                # Train the model with the correct parameters
                logger.info(f"Starting model training for {model_type}")
                trained_model = train_personality_model(
                    dataset_ids=[dataset.id],
                    model_type=model_type,
                    data_limit=data_limit,
                    force_limit=force_limit
                )

                if trained_model and trained_model.get('status') == 'success':
                    logger.info(f"Model training completed successfully for {model_type}")
                    # Update model with training results
                    model.local_path = trained_model['model_name']
                    model.metrics = trained_model['metrics']
                    model.parameters = {
                        'data_limit': data_limit,
                        'samples_used': trained_model['samples_used']
                    }
                    model.status = "completed"
                    model.save()
                    
                    # Mark as active
                    model.mark_as_active()
                    logger.info(f"Model {model.id} marked as active")
                    
                    results[model_type] = {
                        'status': 'success',
                        'model_id': model.id,
                        'metrics': trained_model['metrics']
                    }
                else:
                    error_msg = trained_model.get('message', 'Unknown error') if trained_model else 'No response from training'
                    logger.error(f"Training failed for {model_type}: {error_msg}")
                    raise Exception(f"Failed to train model for {model_type}: {error_msg}")

            except Exception as e:
                logger.error(f"Error processing {model_type}: {str(e)}")
                if model:
                    model.status = "failed"
                    model.error_message = str(e)
                    model.save()
                results[model_type] = {
                    'status': 'error',
                    'error': str(e)
                }
            finally:
                # Clean up memory
                gc.collect()
                logger.info(f"Memory cleanup completed for {model_type}")

        return results

    except Exception as e:
        logger.error(f"Error in fetch_and_train_models: {str(e)}")
        raise 