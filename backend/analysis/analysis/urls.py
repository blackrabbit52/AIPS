from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
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

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]