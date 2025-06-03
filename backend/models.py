from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    created_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    entity_name = db.Column(db.String(100), nullable=False)
    task_type = db.Column(db.String(50), nullable=False)
    task_time = db.Column(db.DateTime, nullable=False)
    contact_person = db.Column(db.String(100), nullable=False)
    note = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='open')
    
    def to_dict(self):
        return {
            'id': self.id,
            'created_date': self.created_date.isoformat(),
            'entity_name': self.entity_name,
            'task_type': self.task_type,
            'task_time': self.task_time.isoformat(),
            'contact_person': self.contact_person,
            'note': self.note,
            'status': self.status
        }
    
    def __repr__(self):
        return f'<Task {self.id}: {self.entity_name} - {self.task_type}>' 