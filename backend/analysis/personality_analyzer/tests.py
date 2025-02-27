from django.test import TestCase
from django.utils import timezone
from .models import PersonalityAnalysis, TrainingData, TrainedModel
from .tasks import analyze_text, analyze_posts, analyze_social_media

class PersonalityAnalysisTest(TestCase):
    """Test cases for personality analysis functionality."""

    def setUp(self):
        """Set up test data."""
        self.test_text = "I enjoy solving complex problems and working independently. " \
                        "I prefer to plan everything in advance and analyze all possibilities."
        
        self.test_posts = [
            "I love diving deep into technical documentation.",
            "Planning and organization are key to success.",
            "Quiet time for reflection helps me think clearly."
        ]

    def test_analyze_text(self):
        """Test single text analysis."""
        # Run analysis
        analysis_id = analyze_text(self.test_text)
        analysis = PersonalityAnalysis.objects.get(id=analysis_id)
        
        # Check basic fields
        self.assertEqual(analysis.raw_text, self.test_text)
        self.assertIsNotNone(analysis.mbti_type)
        self.assertIsNotNone(analysis.mbti_confidence)
        
        # Check OCEAN scores
        self.assertTrue(0 <= analysis.openness <= 1)
        self.assertTrue(0 <= analysis.conscientiousness <= 1)
        self.assertTrue(0 <= analysis.extraversion <= 1)
        self.assertTrue(0 <= analysis.agreeableness <= 1)
        self.assertTrue(0 <= analysis.neuroticism <= 1)
        
        # Check report structure
        self.assertIn('summary', analysis.report)
        self.assertIn('recommendations', analysis.report)

    def test_analyze_posts(self):
        """Test analysis of multiple posts."""
        analysis_id = analyze_posts(self.test_posts)
        analysis = PersonalityAnalysis.objects.get(id=analysis_id)
        
        # Verify combined text analysis
        self.assertIn(self.test_posts[0], analysis.raw_text)
        self.assertIn(self.test_posts[-1], analysis.raw_text)

class TrainingDataTest(TestCase):
    """Test cases for training data management."""

    def setUp(self):
        """Set up test data."""
        self.training_data = TrainingData.objects.create(
            model_type='mbti',
            dataset_name='test-dataset',
            source_url='https://example.com/dataset',
            file_path='/path/to/dataset.csv'
        )

    def test_training_data_creation(self):
        """Test training data record creation."""
        self.assertEqual(self.training_data.model_type, 'mbti')
        self.assertEqual(self.training_data.dataset_name, 'test-dataset')
        self.assertTrue(isinstance(self.training_data.uploaded_at, timezone.datetime))

class TrainedModelTest(TestCase):
    """Test cases for trained model management."""

    def setUp(self):
        """Set up test data."""
        self.training_data = TrainingData.objects.create(
            model_type='ocean',
            dataset_name='test-dataset',
            source_url='https://example.com/dataset',
            file_path='/path/to/dataset.csv'
        )
        
        self.model = TrainedModel.objects.create(
            model_type='ocean',
            version='1.0.0',
            file_path='/path/to/model.pkl',
            metrics={'accuracy': 0.85},
            is_active=True,
            training_data=self.training_data
        )

    def test_model_creation(self):
        """Test model record creation."""
        self.assertEqual(self.model.model_type, 'ocean')
        self.assertEqual(self.model.version, '1.0.0')
        self.assertTrue(self.model.is_active)
        self.assertEqual(self.model.metrics['accuracy'], 0.85)

    def test_model_activation(self):
        """Test model activation logic."""
        # Create a new version of the model
        new_model = TrainedModel.objects.create(
            model_type='ocean',
            version='1.0.1',
            file_path='/path/to/new_model.pkl',
            metrics={'accuracy': 0.87},
            is_active=True,
            training_data=self.training_data
        )
        
        # Refresh the old model from database
        self.model.refresh_from_db()
        
        # Check that old model is now inactive
        self.assertFalse(self.model.is_active)
        # Check that new model is active
        self.assertTrue(new_model.is_active) 