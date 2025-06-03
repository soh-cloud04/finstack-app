from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, Task
from sqlalchemy import or_

api = Blueprint('api', __name__)

@api.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['entity_name', 'task_type', 'task_time', 'contact_person']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        task_time = datetime.fromisoformat(data['task_time'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid task_time format. Use ISO format.'}), 400
    
    task = Task(
        entity_name=data['entity_name'],
        task_type=data['task_type'],
        task_time=task_time,
        contact_person=data['contact_person'],
        note=data.get('note'),
        status='open'
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

@api.route('/tasks', methods=['GET'])
def get_tasks():
    # Get filter parameters
    entity_name = request.args.get('entity_name')
    task_type = request.args.get('task_type')
    status = request.args.get('status')
    contact_person = request.args.get('contact_person')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    sort_by = request.args.get('sort_by', 'created_date')
    sort_order = request.args.get('sort_order', 'desc')
    
    # Build query
    query = Task.query
    
    # Apply filters
    if entity_name:
        query = query.filter(Task.entity_name.ilike(f'%{entity_name}%'))
    if task_type:
        query = query.filter(Task.task_type == task_type)
    if status:
        query = query.filter(Task.status == status)
    if contact_person:
        query = query.filter(Task.contact_person.ilike(f'%{contact_person}%'))
    if start_date:
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Task.task_time >= start)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400
    if end_date:
        try:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Task.task_time <= end)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400
    
    # Apply sorting
    if hasattr(Task, sort_by):
        sort_column = getattr(Task, sort_by)
        if sort_order == 'desc':
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    
    tasks = query.all()
    return jsonify([task.to_dict() for task in tasks])

@api.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify(task.to_dict())

@api.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    
    if 'entity_name' in data:
        task.entity_name = data['entity_name']
    if 'task_type' in data:
        task.task_type = data['task_type']
    if 'task_time' in data:
        try:
            task.task_time = datetime.fromisoformat(data['task_time'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid task_time format'}), 400
    if 'contact_person' in data:
        task.contact_person = data['contact_person']
    if 'note' in data:
        task.note = data['note']
    if 'status' in data:
        if data['status'] not in ['open', 'closed']:
            return jsonify({'error': 'Status must be either "open" or "closed"'}), 400
        task.status = data['status']
    
    db.session.commit()
    return jsonify(task.to_dict())

@api.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return '', 204

@api.route('/tasks/<int:task_id>/status', methods=['PATCH'])
def update_task_status(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    if data['status'] not in ['open', 'closed']:
        return jsonify({'error': 'Status must be either "open" or "closed"'}), 400
    
    task.status = data['status']
    db.session.commit()
    return jsonify(task.to_dict()) 