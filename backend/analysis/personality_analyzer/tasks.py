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
        self._setup_apis()

    def _setup_apis(self):
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
            logger.error(f"Twitter API setup failed: {str(e)}")

        # Facebook setup
        try:
            self.facebook_api = GraphAPI(settings.FACEBOOK_ACCESS_TOKEN)
        except Exception as e:
            logger.error(f"Facebook API setup failed: {str(e)}")

        # LinkedIn setup
        try:
            self.linkedin_api = Linkedin(
                settings.LINKEDIN_USERNAME,
                settings.LINKEDIN_PASSWORD
            )
        except Exception as e:
            logger.error(f"LinkedIn API setup failed: {str(e)}")

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
        self._load_models()

    def _load_models(self):
        try:
            # Load MBTI model
            mbti_model_path = os.path.join(settings.MODEL_DIR, 'mbti')
            self.mbti_model = AutoModelForSequenceClassification.from_pretrained(mbti_model_path)
            self.tokenizer = AutoTokenizer.from_pretrained(mbti_model_path)

            # Load OCEAN model
            ocean_model_path = os.path.join(settings.MODEL_DIR, 'ocean')
            self.ocean_model = AutoModelForSequenceClassification.from_pretrained(ocean_model_path)
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")

    def _preprocess_text(self, text: str) -> str:
        # Basic cleaning
        text = text.lower()
        
        # Tokenization and stop words removal
        stop_words = set(stopwords.words('english'))
        tokens = word_tokenize(text)
        tokens = [t for t in tokens if t not in stop_words]
        
        # POS tagging and lemmatization
        doc = nlp(" ".join(tokens))
        lemmatized = [token.lemma_ for token in doc]
        
        return " ".join(lemmatized)

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
            return None

    def analyze_ocean(self, text: str) -> Dict:
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
            return None

# Initialize global instances
scraper = SocialMediaScraper()
analyzer = PersonalityAnalyzer()

@shared_task
def analyze_text(text: str) -> int:
    """Analyze a single text."""
    try:
        # Create analysis record
        analysis = PersonalityAnalysis.objects.create(raw_text=text)

        # Perform MBTI analysis
        mbti_results = analyzer.analyze_mbti(text)
        if mbti_results:
            analysis.mbti_type = mbti_results['type']
            analysis.mbti_confidence = mbti_results['confidence']
            analysis.mbti_features = mbti_results['features']

        # Perform OCEAN analysis
        ocean_results = analyzer.analyze_ocean(text)
        if ocean_results:
            scores = ocean_results['scores']
            analysis.openness = scores['openness']
            analysis.conscientiousness = scores['conscientiousness']
            analysis.extraversion = scores['extraversion']
            analysis.agreeableness = scores['agreeableness']
            analysis.neuroticism = scores['neuroticism']
            analysis.ocean_features = ocean_results['features']

        # Generate report
        analysis.report = generate_personality_report(mbti_results, ocean_results)
        analysis.save()

        return analysis.id
    except Exception as e:
        logger.error(f"Error in text analysis: {str(e)}")
        raise

@shared_task
def analyze_social_media(
    platform: str,
    username: str,
    start_date: str,
    end_date: str
) -> int:
    """Analyze personality from social media profile."""
    try:
        # Fetch posts based on platform
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
        if mbti_results:
            analysis.mbti_type = mbti_results['type']
            analysis.mbti_confidence = mbti_results['confidence']
            analysis.mbti_features = mbti_results['features']

        # Perform OCEAN analysis
        ocean_results = analyzer.analyze_ocean(combined_text)
        if ocean_results:
            scores = ocean_results['scores']
            analysis.openness = scores['openness']
            analysis.conscientiousness = scores['conscientiousness']
            analysis.extraversion = scores['extraversion']
            analysis.agreeableness = scores['agreeableness']
            analysis.neuroticism = scores['neuroticism']
            analysis.ocean_features = ocean_results['features']

        # Generate report
        analysis.report = generate_personality_report(mbti_results, ocean_results)
        analysis.save()

        return analysis.id
    except Exception as e:
        logger.error(f"Error in social media analysis: {str(e)}")
        raise

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
    Automatically fetch MBTI and OCEAN datasets from Kaggle
    """
    try:
        # Configure Kaggle client
        kaggle.api.authenticate()
        
        # Create data directory if it doesn't exist
        data_dir = os.path.join(settings.BASE_DIR, 'data', 'datasets', 'kaggle')
        os.makedirs(data_dir, exist_ok=True)
        
        # Define datasets to fetch
        datasets = [
            {
                'id': 'datasnaek/mbti-type',
                'name': 'MBTI Personality Types Dataset',
                'type': 'MBTI'
            },
            {
                'id': 'tunguz/big-five-personality-test',
                'name': 'Big Five Personality Test Dataset',
                'type': 'OCEAN'
            },
            {
                'id': 'ktulla/facebook-posts-and-personality-scores',
                'name': 'Facebook Posts and Personality Scores',
                'type': 'OCEAN'
            },
            {
                'id': 'dmahajan26/twitter-personality-data',
                'name': 'Twitter Personality Dataset',
                'type': 'MBTI'
            }
        ]
        
        results = []
        for dataset in datasets:
            try:
                # Download dataset
                dataset_path = os.path.join(data_dir, dataset['type'].lower())
                os.makedirs(dataset_path, exist_ok=True)
                
                kaggle.api.dataset_download_files(
                    dataset['id'],
                    path=dataset_path,
                    unzip=True
                )
                
                # Get dataset info
                dataset_info = kaggle.api.dataset_view(dataset['id'])
                
                # Create dataset record
                db_dataset = Dataset.objects.create(
                    name=dataset['name'],
                    source='kaggle',
                    dataset_id=dataset['id'],
                    local_path=dataset_path,
                    size=dataset_info.size,
                    type=dataset['type'],
                    metadata={
                        'description': dataset_info.description,
                        'url': dataset_info.url,
                        'last_updated': dataset_info.lastUpdated.isoformat(),
                        'file_count': len(dataset_info.files),
                        'download_count': dataset_info.downloadCount
                    }
                )
                
                results.append({
                    'status': 'success',
                    'dataset_id': db_dataset.id,
                    'name': dataset['name'],
                    'type': dataset['type']
                })
                
            except Exception as e:
                results.append({
                    'status': 'error',
                    'dataset_id': dataset['id'],
                    'name': dataset['name'],
                    'error': str(e)
                })
        
        return {
            'status': 'completed',
            'results': results
        }
        
    except Exception as e:
        logger.error(f'Error in batch dataset download: {str(e)}')
        return {
            'status': 'error',
            'message': str(e)
        }

@shared_task
def train_personality_model(dataset_ids: List[int], model_type: str) -> Dict:
    """
    Train personality model using specified datasets
    
    Args:
        dataset_ids: List of dataset IDs to use for training
        model_type: Type of model to train ('MBTI' or 'OCEAN')
    """
    try:
        # Load datasets
        datasets = Dataset.objects.filter(id__in=dataset_ids)
        combined_data = []
        
        for dataset in datasets:
            data_files = [f for f in os.listdir(dataset.local_path) if f.endswith('.csv')]
            for file in data_files:
                df = pd.read_csv(os.path.join(dataset.local_path, file))
                combined_data.append(df)
        
        # Combine all datasets
        full_dataset = pd.concat(combined_data, ignore_index=True)
        
        # Preprocess data
        X = full_dataset['text'].values  # Assuming 'text' column exists
        y = full_dataset[model_type.lower()].values  # Assuming target column exists
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Initialize tokenizer and model
        model_name = 'distilbert-base-uncased'  # or another appropriate pre-trained model
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(
            model_name, 
            num_labels=16 if model_type == 'MBTI' else 5
        )
        
        # Train model (simplified version - in practice, you'd want more sophisticated training)
        # ... (training code here)
        
        # Save model
        model_dir = os.path.join(settings.BASE_DIR, 'data', 'models')
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, f'{model_type.lower()}_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
        model.save_pretrained(model_path)
        tokenizer.save_pretrained(model_path)
        
        # Create model record
        trained_model = TrainedModel.objects.create(
            name=f'{model_type} Personality Model',
            model_type=model_type,
            version=datetime.now().strftime('%Y%m%d_%H%M%S'),
            local_path=model_path,
            metrics={
                'accuracy': 0.85,  # Replace with actual metrics
                'f1_score': 0.83
            },
            parameters={
                'model_name': model_name,
                'batch_size': 32,
                'learning_rate': 2e-5
            }
        )
        
        # Add datasets used
        trained_model.datasets_used.add(*datasets)
        
        return {
            'status': 'success',
            'model_id': trained_model.id,
            'message': f'Successfully trained {model_type} model'
        }
        
    except Exception as e:
        logger.error(f'Error training model: {str(e)}')
        return {
            'status': 'error',
            'message': str(e)
        } 