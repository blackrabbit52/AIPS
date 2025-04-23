from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from celery import Celery
import os

# Initialise extensions
db = SQLAlchemy()
migrate = Migrate()
celery = Celery()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@recommendation-db:5432/recommendation')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['CELERY_BROKER_URL'] = os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/0')
    app.config['CELERY_RESULT_BACKEND'] = os.getenv('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')
    
    # Initialise extensions
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Configuration Celery
    celery.conf.update(app.config)
    
    # Registering blueprints
    from .routes import recommendation_bp
    app.register_blueprint(recommendation_bp, url_prefix='/api/recommend')
    
    return app 