import unittest
from datetime import datetime, timedelta, timezone
from app import create_app
from models import db, Task
from urllib.parse import quote

class TestTaskAPI(unittest.TestCase):
    def setUp(self):
        """Set up test environment before each test"""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            # Create test data
            self.create_test_tasks()
    
    def tearDown(self):
        """Clean up after each test"""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
    
    def create_test_tasks(self):
        """Helper method to create test tasks"""
        tasks = [
            Task(
                entity_name="Acme Corp",
                task_type="Client Meeting",
                task_time=datetime.now(timezone.utc) + timedelta(days=1),
                contact_person="John Smith",
                note="Quarterly review",
                status="open"
            ),
            Task(
                entity_name="TechStart Inc",
                task_type="Follow-up Call",
                task_time=datetime.now(timezone.utc) + timedelta(days=2),
                contact_person="Sarah Johnson",
                note="Proposal discussion",
                status="open"
            ),
            Task(
                entity_name="Global Tech",
                task_type="Client Meeting",
                task_time=datetime.now(timezone.utc) + timedelta(days=3),
                contact_person="Mike Brown",
                note="Contract renewal",
                status="closed"
            )
        ]
        db.session.add_all(tasks)
        db.session.commit()
    
    def test_create_task_success(self):
        """Test successful task creation"""
        task_data = {
            "entity_name": "New Corp",
            "task_type": "Initial Meeting",
            "task_time": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
            "contact_person": "Alice Cooper",
            "note": "First meeting with client"
        }
        
        response = self.client.post('/api/tasks', json=task_data)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['entity_name'], task_data['entity_name'])
        self.assertEqual(data['status'], 'open')
    
    def test_create_task_missing_fields(self):
        """Test task creation with missing required fields"""
        task_data = {
            "entity_name": "New Corp",
            "task_type": "Initial Meeting"
            # Missing required fields: task_time and contact_person
        }
        
        response = self.client.post('/api/tasks', json=task_data)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
    
    def test_create_task_invalid_date(self):
        """Test task creation with invalid date format"""
        task_data = {
            "entity_name": "New Corp",
            "task_type": "Initial Meeting",
            "task_time": "invalid-date",
            "contact_person": "Alice Cooper"
        }
        
        response = self.client.post('/api/tasks', json=task_data)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
    
    def test_get_all_tasks(self):
        """Test retrieving all tasks"""
        response = self.client.get('/api/tasks')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 3)  # We created 3 tasks in setUp
    
    def test_get_tasks_filter_by_status(self):
        """Test filtering tasks by status"""
        response = self.client.get('/api/tasks?status=open')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(all(task['status'] == 'open' for task in data))
    
    def test_get_tasks_filter_by_contact_person(self):
        """Test filtering tasks by contact person"""
        response = self.client.get('/api/tasks?contact_person=John')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(all('John' in task['contact_person'] for task in data))
    
    def test_get_tasks_filter_by_task_type(self):
        """Test filtering tasks by task type"""
        response = self.client.get('/api/tasks?task_type=Client%20Meeting')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(all(task['task_type'] == 'Client Meeting' for task in data))
    
    def test_get_tasks_filter_by_date_range(self):
        """Test filtering tasks by date range"""
        start_date = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        end_date = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
        response = self.client.get(f'/api/tasks?start_date={quote(start_date)}&end_date={quote(end_date)}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(len(data) > 0)
    
    def test_get_tasks_sorting(self):
        """Test sorting tasks by different fields"""
        # Test ascending sort by entity name
        response = self.client.get('/api/tasks?sort_by=entity_name&sort_order=asc')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data[0]['entity_name'] <= data[1]['entity_name'])
        
        # Test descending sort by task time
        response = self.client.get('/api/tasks?sort_by=task_time&sort_order=desc')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(
            datetime.fromisoformat(data[0]['task_time'].replace('Z', '+00:00')) >= 
            datetime.fromisoformat(data[1]['task_time'].replace('Z', '+00:00'))
        )
    
    def test_get_single_task(self):
        """Test retrieving a single task"""
        response = self.client.get('/api/tasks/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['id'], 1)
    
    def test_get_nonexistent_task(self):
        """Test retrieving a non-existent task"""
        response = self.client.get('/api/tasks/999')
        self.assertEqual(response.status_code, 404)
    
    def test_update_task(self):
        """Test updating a task"""
        update_data = {
            "entity_name": "Updated Corp",
            "contact_person": "New Person",
            "note": "Updated note"
        }
        
        response = self.client.put('/api/tasks/1', json=update_data)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['entity_name'], update_data['entity_name'])
        self.assertEqual(data['contact_person'], update_data['contact_person'])
        self.assertEqual(data['note'], update_data['note'])
    
    def test_update_task_invalid_date(self):
        """Test updating a task with invalid date"""
        update_data = {
            "task_time": "invalid-date"
        }
        
        response = self.client.put('/api/tasks/1', json=update_data)
        self.assertEqual(response.status_code, 400)
    
    def test_update_task_status(self):
        """Test updating task status"""
        # Test changing to closed
        response = self.client.patch('/api/tasks/1/status', json={'status': 'closed'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'closed')
        
        # Test changing back to open
        response = self.client.patch('/api/tasks/1/status', json={'status': 'open'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'open')
    
    def test_update_task_status_invalid(self):
        """Test updating task status with invalid value"""
        response = self.client.patch('/api/tasks/1/status', json={'status': 'invalid'})
        self.assertEqual(response.status_code, 400)
    
    def test_delete_task(self):
        """Test deleting a task"""
        # First verify task exists
        response = self.client.get('/api/tasks/1')
        self.assertEqual(response.status_code, 200)
        
        # Delete the task
        response = self.client.delete('/api/tasks/1')
        self.assertEqual(response.status_code, 204)
        
        # Verify task no longer exists
        response = self.client.get('/api/tasks/1')
        self.assertEqual(response.status_code, 404)
    
    def test_delete_nonexistent_task(self):
        """Test deleting a non-existent task"""
        response = self.client.delete('/api/tasks/999')
        self.assertEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main() 