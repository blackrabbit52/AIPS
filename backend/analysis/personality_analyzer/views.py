from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from celery.result import AsyncResult
from .models import PersonalityAnalysis, TrainedModel, Dataset
from .tasks import analyze_social_media, analyze_text, train_personality_model, fetch_kaggle_datasets, fetch_and_train_models
from .serializers import (
    PersonalityAnalysisSerializer,
    TrainedModelSerializer,
    DatasetSerializer,
    AnalysisRequestSerializer
)
import logging
from django.utils import timezone
from django.db.models import Q

logger = logging.getLogger(__name__)

class PersonalityAnalysisViewSet(viewsets.ModelViewSet):
    """
    ViewSet for personality analysis
    """
    queryset = PersonalityAnalysis.objects.all()
    serializer_class = PersonalityAnalysisSerializer
    permission_classes = []

    @action(detail=False, methods=['POST'])
    def analyze_text(self, request):
        """
        Endpoint to directly analyse a text
         """
        try:
            serializer = AnalysisRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if models are available
            from .tasks import analyzer
            if not analyzer.models_available:
                return Response({
                    'status': 'error',
                    'message': 'Models are not available. Please train models first using /datasets/fetch_and_train/',
                    'models_available': False
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            # Launch analysis as async task
            task = analyze_text.delay(serializer.validated_data['text'])
            
            return Response({
                'task_id': task.id,
                'status': 'processing'
            }, status=status.HTTP_202_ACCEPTED)

        except Exception as e:
            logger.error(f"Error in text analysis: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['POST'])
    def analyze_social_media(self, request):
        """
         Endpoint to analyse a social media profile
        """
        try:
            required_fields = ['platform', 'username', 'start_date', 'end_date']
            if not all(field in request.data for field in required_fields):
                return Response({
                    'error': 'Missing required fields'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if models are available
            from .tasks import analyzer
            if not analyzer.models_available:
                return Response({
                    'status': 'error',
                    'message': 'Models are not available. Please train models first using /datasets/fetch_and_train/',
                    'models_available': False
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            task = analyze_social_media.delay(
                request.data['platform'],
                request.data['username'],
                request.data['start_date'],
                request.data['end_date']
            )

            return Response({
                'task_id': task.id,
                'status': 'processing'
            }, status=status.HTTP_202_ACCEPTED)

        except Exception as e:
            logger.error(f"Error in social media analysis: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['GET'])
    def check_models_status(self, request):
        """
        Check if models are available for analysis
        """
        try:
            from .tasks import analyzer
            
            return Response({
                'models_available': analyzer.models_available,
                'status': 'ready' if analyzer.models_available else 'not_ready',
                'message': 'Models are available and ready for analysis' if analyzer.models_available else 
                          'Models are not available. Please train models first using /datasets/fetch_and_train/'
            })
            
        except Exception as e:
            logger.error(f"Error checking models status: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['GET'])
    def task_status(self, request):
        """
         Check the status of an analysis task
        """
        task_id = request.query_params.get('task_id')
        if not task_id:
            return Response({
                'error': 'task_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            task_result = AsyncResult(task_id)
            
            # Handle WorkerLostError and other special cases
            if task_result.failed():
                error = task_result.result
                error_message = str(error) if error else "Unknown error"
                error_type = type(error).__name__ if error else "Unknown error type"
                
                # Return a properly structured error response
                return Response({
                    'task_id': task_id,
                    'status': 'FAILURE',
                    'result': {
                        'error_type': error_type,
                        'message': error_message,
                        'details': "Le worker a été interrompu, probablement à cause d'un manque de mémoire"
                    }
                })
            
            # Return normal response for successful tasks
            return Response({
                'task_id': task_id,
                'status': task_result.status,
                'result': task_result.result if task_result.ready() else None
            })
        except Exception as e:
            # Handle any other exceptions that might occur
            logger.error(f"Error checking task status: {str(e)}")
            return Response({
                'task_id': task_id,
                'status': 'ERROR',
                'result': {
                    'error_type': type(e).__name__,
                    'message': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['GET'])
    def training_status(self, request):
        """
        Check if a model training task is in progress
        """
        try:
            # Check active training tasks
            active_tasks = CeleryTask.objects.filter(
                task_name__contains='train_personality_model',
                status__in=['PENDING', 'STARTED']
            ).order_by('-date_created')
            
            # Also check fetch_and_train tasks
            fetch_train_tasks = CeleryTask.objects.filter(
                task_name='personality_analyzer.tasks.fetch_and_train_models',
                status__in=['PENDING', 'STARTED']
            ).order_by('-date_created')
            
            all_active_tasks = list(active_tasks) + list(fetch_train_tasks)
            
            if all_active_tasks:
                task = all_active_tasks[0]
                # Estimate progress based on task runtime (simplified)
                total_expected_time = 600  # Estimated seconds for completion
                elapsed_time = (timezone.now() - task.date_created).total_seconds()
                progress = min(int((elapsed_time / total_expected_time) * 100), 95)
                
                return Response({
                    'is_training': True,
                    'task_id': task.task_id,
                    'status': task.status,
                    'progress': progress,
                    'started_at': task.date_created
                })
            else:
                return Response({
                    'is_training': False
                })
                
        except Exception as e:
            logger.error(f"Error checking training status: {str(e)}")
            return Response({
                'is_training': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TrainedModelViewSet(viewsets.ModelViewSet):
    """
     ViewSet for managing trained models
    """
    queryset = TrainedModel.objects.all()
    serializer_class = TrainedModelSerializer
    permission_classes = []

    @action(detail=False, methods=['POST'])
    def train_model(self, request):
        """
        Endpoint to launch the training of a new model
        """
        try:
            if 'dataset_ids' not in request.data or 'model_type' not in request.data:
                return Response({
                    'error': 'dataset_ids and model_type are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            task = train_personality_model.delay(
                request.data['dataset_ids'],
                request.data['model_type']
            )

            return Response({
                'task_id': task.id,
                'status': 'training_started'
            }, status=status.HTTP_202_ACCEPTED)

        except Exception as e:
            logger.error(f"Error starting model training: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['POST'])
    def activate(self, request, pk=None):
        """
         Activate a specific model
        """
        model = self.get_object()
        try:
            # Deactivate other models of the same type
            TrainedModel.objects.filter(
                model_type=model.model_type,
                is_active=True
            ).update(is_active=False)
            
            # Activate the selected model
            model.is_active = True
            model.save()

            return Response({
                'status': 'success',
                'message': f'Model {model.name} activated'
            })

        except Exception as e:
            logger.error(f"Error activating model: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DatasetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing datasets
    """
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    permission_classes = []

    @action(detail=False, methods=['POST'])
    def import_dataset(self, request):
        """
        Endpoint to import a new dataset
        """
        try:
            if 'file' not in request.FILES:
                return Response({
                    'error': 'No file provided'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Dataset import logic
            # Implement the import logic

            return Response({
                'status': 'success',
                'message': 'Dataset imported successfully'
            })

        except Exception as e:
            logger.error(f"Error importing dataset: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['POST'])
    def fetch_kaggle_datasets(self, request):
        """
         Endpoint to automatically download datasets from Kaggle
        """
        try:
            # Launch the asynchronous task
            task = fetch_kaggle_datasets.delay()
            
            return Response({
                'task_id': task.id,
                'status': 'downloading',
                'message': 'Dataset download from Kaggle started'
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            logger.error(f"Error downloading Kaggle datasets: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['POST'])
    def fetch_and_train(self, request):
        """
        Endpoint to download datasets and train models in one operation
        """
        try:
            # Get model types to train
            model_types = request.data.get('model_types', ['MBTI', 'OCEAN'])
            # Get data limit parameter
            data_limit = request.data.get('data_limit', None)
            # Get additional parameters
            show_total_count = request.data.get('show_total_count', True)
            allow_alternative_formats = request.data.get('allow_alternative_formats', True)
            force_limit = request.data.get('force_limit', True)
            convert_ocean_format = request.data.get('convert_ocean_format', True)
            check_existing_files = request.data.get('check_existing_files', True)
            ocean_filename = request.data.get('ocean_filename', 'IPIP-FFM-data-8Nov2018')
            
            # Log parameters for debugging
            logger.info(f"fetch_and_train called with: model_types={model_types}, data_limit={data_limit}")
            logger.info(f"Additional parameters: force_limit={force_limit}, allow_alternative_formats={allow_alternative_formats}")
            
            # Start the combined task with all parameters
            task = fetch_and_train_models.delay(
                model_types=model_types,
                data_limit=data_limit,
                allow_alternative_formats=allow_alternative_formats,
                force_limit=force_limit,
                convert_ocean_format=convert_ocean_format,
                check_existing_files=check_existing_files,
                ocean_filename=ocean_filename
            )
            
            return Response({
                'task_id': task.id,
                'status': 'processing',
                'message': 'Dataset downloading and model training started',
                'data_limit': data_limit
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            logger.error(f"Error in fetch and train operation: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 