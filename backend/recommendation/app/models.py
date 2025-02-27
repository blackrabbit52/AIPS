from . import db
from datetime import datetime

class TeamRole(db.Model):
    __tablename__ = 'team_roles'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_traits = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<TeamRole {self.name}>'

class Recommendation(db.Model):
    __tablename__ = 'recommendations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('team_roles.id'), nullable=False)
    personality_traits = db.Column(db.JSON, nullable=False)
    score = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relations
    role = db.relationship('TeamRole', backref='recommendations')

    def __repr__(self):
        return f'<Recommendation {self.id} for user {self.user_id}>' 