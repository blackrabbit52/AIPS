from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from personality_analyzer.views import (
    DatasetViewSet,
    TrainedModelViewSet,
    PersonalityAnalysisViewSet
)

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'datasets', DatasetViewSet)
router.register(r'models', TrainedModelViewSet)
router.register(r'analysis', PersonalityAnalysisViewSet)

# Health check endpoint
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('api/health/', health_check, name='health_check'),
    path('api/health', health_check),  # Also handle without trailing slash
]