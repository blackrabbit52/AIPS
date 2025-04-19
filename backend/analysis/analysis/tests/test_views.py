from django.test import TestCase, Client
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
import json

class AnalysisViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.analyze_text_url = reverse('analyze_text')
        self.analyze_social_media_url = reverse('analyze_social_media')
        self.task_status_url = reverse('task_status')
        self.check_models_status_url = reverse('check_models_status')

    @patch('analysis.views.analyze_text')
    def test_analyze_text_success(self, mock_analyze):
        mock_analyze.return_value = {
            'mbti': 'INTJ',
            'ocean': {
                'openness': 0.8,
                'conscientiousness': 0.7,
                'extraversion': 0.3,
                'agreeableness': 0.6,
                'neuroticism': 0.4
            }
        }
        
        response = self.client.post(
            self.analyze_text_url,
            {'text': 'This is a test text for personality analysis.'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('mbti', response.data)
        self.assertIn('ocean', response.data)

    def test_analyze_text_missing_text(self):
        response = self.client.post(
            self.analyze_text_url,
            {},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('analysis.views.analyze_social_media')
    def test_analyze_social_media_success(self, mock_analyze):
        mock_analyze.return_value = {
            'mbti': 'ENFP',
            'ocean': {
                'openness': 0.9,
                'conscientiousness': 0.6,
                'extraversion': 0.8,
                'agreeableness': 0.7,
                'neuroticism': 0.3
            }
        }
        
        response = self.client.post(
            self.analyze_social_media_url,
            {
                'username': 'testuser',
                'platform': 'twitter',
                'start_date': '2024-01-01',
                'end_date': '2024-01-31'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('mbti', response.data)
        self.assertIn('ocean', response.data)

    def test_analyze_social_media_missing_fields(self):
        response = self.client.post(
            self.analyze_social_media_url,
            {
                'username': 'testuser'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('analysis.views.get_task_status')
    def test_task_status_success(self, mock_status):
        mock_status.return_value = {
            'status': 'SUCCESS',
            'result': {
                'mbti': 'ISTJ',
                'ocean': {
                    'openness': 0.5,
                    'conscientiousness': 0.8,
                    'extraversion': 0.3,
                    'agreeableness': 0.6,
                    'neuroticism': 0.4
                }
            }
        }
        
        response = self.client.get(
            f'{self.task_status_url}?task_id=test_task_id'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'SUCCESS')

    def test_task_status_missing_task_id(self):
        response = self.client.get(self.task_status_url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('analysis.views.check_models_status')
    def test_check_models_status_success(self, mock_check):
        mock_check.return_value = {
            'mbti': True,
            'ocean': True
        }
        
        response = self.client.get(self.check_models_status_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('mbti', response.data)
        self.assertIn('ocean', response.data) 