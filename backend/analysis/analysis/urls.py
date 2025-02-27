from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from personality_analyzer.views import (
    PersonalityAnalysisViewSet,
    TrainingDataViewSet,
    TrainedModelViewSet
)

router = DefaultRouter()
router.register(r'analyses', PersonalityAnalysisViewSet)
router.register(r'training-data', TrainingDataViewSet)
router.register(r'models', TrainedModelViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/health/', PersonalityAnalysisViewSet.as_view({'get': 'health'})),
]