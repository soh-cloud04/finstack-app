import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../task.service'; // Import TaskService

@Component({
  selector: 'app-new-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-task-modal.component.html',
  styleUrls: ['./new-task-modal.component.css']
})
export class NewTaskModalComponent implements OnInit {

  // Output event to notify the parent component to close the modal
  @Output() closeModal = new EventEmitter<void>();
  // Output event to notify the parent component that a task was saved
  @Output() taskCreated = new EventEmitter<Task>(); // Changed event name

  // Properties to hold form data
  entityName: string = '';
  taskDate: string = '';
  taskHour: number = 12;
  taskMinute: number = 0;
  taskAmpm: 'AM' | 'PM' = 'PM';
  taskType: string = 'Call';
  phoneNumber: string = ''; // Assuming phone number is only for Call type
  contactPerson: string = '';
  note: string = '';
  status: 'open' | 'closed' = 'open'; // Default status

  hours: number[] = [];
  minutes: number[] = [];

  constructor(private taskService: TaskService) { } // Inject TaskService

  ngOnInit(): void {
    // Initialize hour and minute options
    this.hours = Array.from({ length: 12 }, (_, i) => i + 1);
    this.minutes = Array.from({ length: 60 }, (_, i) => i);
    // No need to call initializeForm here as it's only for editing
  }

  // Method to close the modal
  cancel(): void {
    this.closeModal.emit();
  }

  // Method to save the new task
  save(): void {
    // Validate required fields
    if (!this.entityName || !this.taskDate || !this.contactPerson) {
      alert('Please fill in all required fields (Entity name, Date, and Contact person)');
      return;
    }

    // Construct task time from date and time inputs
    const [year, month, day] = this.taskDate.split('-').map(Number);
    let hour = this.taskHour;
    if (this.taskAmpm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (this.taskAmpm === 'AM' && hour === 12) {
      hour = 0;
    }

    const taskTime = new Date(year, month - 1, day, hour, this.taskMinute);

    // Create task object for the backend
    const newTaskPayload: Omit<Task, 'id' | 'created_date' | 'status'> = {
      entity_name: this.entityName,
      task_type: this.taskType,
      task_time: taskTime.toISOString(),
      contact_person: this.contactPerson,
      note: this.note || undefined,
    };

    if (this.taskType === 'Call' && !this.phoneNumber) {
      alert('Please enter a phone number for Call tasks');
      return;
    }

    // Add phone number to payload if necessary and supported by backend
    // if (this.taskType === 'Call') {
    //   newTaskPayload.phoneNumber = this.phoneNumber;
    // }

    this.taskService.createTask(newTaskPayload).subscribe({
      next: (responseTask: Task) => {
        console.log('Task created successfully:', responseTask);
        this.taskCreated.emit(responseTask); // Emit the created task
        this.closeModal.emit(); // Close modal after saving
      },
      error: (error: any) => {
        console.error('Error creating task:', error);
        alert('Error creating task. Please try again.');
      }
    });
  }

  // Method to toggle status button
  toggleStatus(status: 'open' | 'closed'): void {
    this.status = status;
  }

  // Method to handle task type change (to show/hide phone number)
  onTaskTypeChange(): void {
    if (this.taskType !== 'Call') {
      this.phoneNumber = ''; // Clear phone number if not Call
    }
  }
} 