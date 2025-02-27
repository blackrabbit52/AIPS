from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PersonalityAnalysis, TrainingData, TrainedModel
from .serializers import (
    PersonalityAnalysisSerializer, TrainingDataSerializer, TrainedModelSerializer,
    SocialMediaAnalysisRequestSerializer, TextAnalysisRequestSerializer, PostsAnalysisRequestSerializer
)
from .tasks import (
    analyze_text, analyze_posts, analyze_social_media,
    download_datasets, train_model
)

class PersonalityAnalysisViewSet(viewsets.ModelViewSet):
    """API endpoint for personality analysis operations."""
    
    queryset = PersonalityAnalysis.objects.all()
    serializer_class = PersonalityAnalysisSerializer

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
    def analyze_text(self, request):
        """Analyze personality from a single text input."""
        text = request.data.get('text')
        if not text:
            return Response(
                {'error': 'Text field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Start analysis task
        analysis_id = analyze_text.delay(text)
        return Response({'task_id': str(analysis_id)})

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
        analysis_id = analyze_posts.delay(posts)
        return Response({'task_id': str(analysis_id)})

    @action(detail=False, methods=['post'])
    def analyze_social(self, request):
        """Analyze personality from social media posts."""
        social_network = request.data.get('social_network')
        username = request.data.get('username')
        
        if not all([social_network, username]):
            return Response(
                {'error': 'Both social_network and username are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Start analysis task
        analysis_id = analyze_social_media.delay(social_network, username)
        return Response({'task_id': str(analysis_id)})

class TrainingDataViewSet(viewsets.ModelViewSet):
    """API endpoint for managing training datasets."""
    
    queryset = TrainingData.objects.all()
    serializer_class = TrainingDataSerializer

    @action(detail=False, methods=['post'])
    def download_datasets(self, request):
        result = download_datasets.delay()
        return Response({'task_id': result.id}, status=status.HTTP_202_ACCEPTED)

class TrainedModelViewSet(viewsets.ModelViewSet):
    """API endpoint for managing trained models."""
    
    queryset = TrainedModel.objects.all()
    serializer_class = TrainedModelSerializer

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a specific model version."""
        model = self.get_object()
        
        # Deactivate other models of the same type
        TrainedModel.objects.filter(
            model_type=model.model_type,
            is_active=True
        ).update(is_active=False)
        
        # Activate the selected model
        model.is_active = True
        model.save()
        
        return Response({'status': 'Model activated successfully'})
    
    @action(detail=True, methods=['get'])
    def metrics(self, request, pk=None):
        """Get detailed metrics for the model."""
        model = self.get_object()
        return Response(model.metrics)

    @action(detail=False, methods=['post'])
    def train(self, request):
        model_type = request.data.get('model_type')
        if model_type not in dict(TrainedModel.MODEL_TYPES):
            return Response(
                {'error': 'Invalid model type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        result = train_model.delay(model_type)
        return Response({'task_id': result.id}, status=status.HTTP_202_ACCEPTED) 