from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Dataset, TrainedModel, PersonalityAnalysis
from .tasks import (
    analyze_text,
    analyze_social_media,
    fetch_kaggle_datasets,
    train_personality_model
)
from .serializers import (
    DatasetSerializer,
    TrainedModelSerializer,
    PersonalityAnalysisSerializer
)
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DatasetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing datasets
    """
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer

    @action(detail=False, methods=['post'])
    def fetch_kaggle(self, request):
        """
        Fetch all relevant personality datasets from Kaggle.
        This will download MBTI and OCEAN datasets automatically.
        """
        task = fetch_kaggle_datasets.delay()
        return Response({
            'status': 'Task started',
            'task_id': task.id,
            'message': 'Downloading personality datasets from Kaggle'
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get datasets filtered by type (MBTI or OCEAN)"""
        dataset_type = request.query_params.get('type', '').upper()
        if dataset_type not in ['MBTI', 'OCEAN']:
            return Response({
                'error': 'Invalid dataset type. Must be either MBTI or OCEAN'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        datasets = self.queryset.filter(type=dataset_type)
        serializer = self.serializer_class(datasets, many=True)
        return Response(serializer.data)

class TrainedModelViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing trained models
    """
    queryset = TrainedModel.objects.all()
    serializer_class = TrainedModelSerializer

    @action(detail=False, methods=['post'])
    def train(self, request):
        """Train a new model using specified datasets"""
        dataset_ids = request.data.get('dataset_ids', [])
        model_type = request.data.get('model_type', '').upper()

        if not dataset_ids:
            return Response({
                'error': 'No datasets specified'
            }, status=status.HTTP_400_BAD_REQUEST)

        if model_type not in ['MBTI', 'OCEAN']:
            return Response({
                'error': 'Invalid model type. Must be either MBTI or OCEAN'
            }, status=status.HTTP_400_BAD_REQUEST)

        task = train_personality_model.delay(dataset_ids, model_type)
        return Response({
            'status': 'Task started',
            'task_id': task.id,
            'message': f'Training new {model_type} model'
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get models filtered by type (MBTI or OCEAN)"""
        model_type = request.query_params.get('type', '').upper()
        if model_type not in ['MBTI', 'OCEAN']:
            return Response({
                'error': 'Invalid model type. Must be either MBTI or OCEAN'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        models = self.queryset.filter(model_type=model_type, is_active=True)
        serializer = self.serializer_class(models, many=True)
        return Response(serializer.data)

class PersonalityAnalysisViewSet(viewsets.ModelViewSet):
    """
    ViewSet for personality analysis
    """
    queryset = PersonalityAnalysis.objects.all()
    serializer_class = PersonalityAnalysisSerializer

    @action(detail=False, methods=['post'])
    def analyze_text(self, request):
        """Analyze personality from text input"""
        text = request.data.get('text', '').strip()
        if not text:
            return Response({
                'error': 'No text provided'
            }, status=status.HTTP_400_BAD_REQUEST)

        task = analyze_text.delay(text)
        return Response({
            'status': 'Task started',
            'task_id': task.id,
            'message': 'Text analysis started'
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['post'])
    def analyze_social_media(self, request):
        """Analyze personality from social media profile"""
        username = request.data.get('username', '').strip()
        platform = request.data.get('platform', '').lower()
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        if not username:
            return Response({
                'error': 'Username is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        if platform not in ['twitter', 'facebook', 'linkedin']:
            return Response({
                'error': 'Invalid platform. Must be twitter, facebook, or linkedin'
            }, status=status.HTTP_400_BAD_REQUEST)

        task = analyze_social_media.delay(platform, username, start_date, end_date)
        return Response({
            'status': 'Task started',
            'task_id': task.id,
            'message': f'Social media analysis started for {platform} user {username}'
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['get'])
    def health(self, request):
        """Health check endpoint."""
        try:
            # Check database connection
            PersonalityAnalysis.objects.first()
            return Response({'status': 'healthy'})
        except Exception as e:
            return Response(
                {'status': 'unhealthy', 'error': str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    @action(detail=False, methods=['post'])
    def analyze_posts(self, request):
        """Analyze personality from multiple text posts."""
        posts = request.data.get('posts', [])
        if not posts:
            return Response(
                {'error': 'Posts array is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Start analysis task
        analysis_id = analyze_social_media.delay(
            username='multiple_posts',
            platform='text_input',
            start_date=datetime.now().strftime('%Y-%m-%d'),
            end_date=datetime.now().strftime('%Y-%m-%d'),
            posts=posts
        )
        return Response({'task_id': str(analysis_id)}) 