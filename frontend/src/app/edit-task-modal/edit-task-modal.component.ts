import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../task.service';

@Component({
  selector: 'app-edit-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-task-modal.component.html',
  styleUrls: ['./edit-task-modal.component.css']
})
export class EditTaskModalComponent implements OnInit, OnChanges {

  @Input() taskToEdit!: Task; // Input property to receive task data

  @Output() closeModal = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<Task>();

  // Properties to hold form data
  entityName: string = '';
  taskDate: string = '';
  taskHour: number = 12;
  taskMinute: number = 0;
  taskAmpm: 'AM' | 'PM' = 'PM';
  taskType: string = '';
  phoneNumber: string = '';
  contactPerson: string = '';
  note: string = '';
  status: 'open' | 'closed' = 'open';

  hours: number[] = [];
  minutes: number[] = [];

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.hours = Array.from({ length: 12 }, (_, i) => i + 1);
    this.minutes = Array.from({ length: 60 }, (_, i) => i);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskToEdit'] && this.taskToEdit) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    if (this.taskToEdit) {
      this.entityName = this.taskToEdit.entity_name;
      this.taskType = this.taskToEdit.task_type;
      const taskTime = new Date(this.taskToEdit.task_time);
      const hours = taskTime.getHours();
      this.taskHour = hours % 12 || 12;
      this.taskMinute = taskTime.getMinutes();
      this.taskAmpm = hours >= 12 ? 'PM' : 'AM';
      this.taskDate = taskTime.toISOString().split('T')[0];
      this.contactPerson = this.taskToEdit.contact_person;
      this.note = this.taskToEdit.note || '';
      this.status = this.taskToEdit.status;

      // You might need to handle phoneNumber if it's part of the Task model
      // this.phoneNumber = this.taskToEdit.phoneNumber || ''; 
    }
  }

  cancel(): void {
    this.closeModal.emit();
  }

  save(): void {
    if (!this.entityName || !this.taskDate || !this.contactPerson) {
      alert('Please fill in all required fields (Entity name, Date, and Contact person)');
      return;
    }

    const [year, month, day] = this.taskDate.split('-').map(Number);
    let hour = this.taskHour;
    if (this.taskAmpm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (this.taskAmpm === 'AM' && hour === 12) {
      hour = 0;
    }
    const taskTime = new Date(year, month - 1, day, hour, this.taskMinute);

    const updatedTaskPayload: Partial<Task> = {
      entity_name: this.entityName,
      task_type: this.taskType,
      task_time: taskTime.toISOString(),
      contact_person: this.contactPerson,
      note: this.note || undefined,
      status: this.status
    };

    if (this.taskType === 'Call' && !this.phoneNumber) {
      alert('Please enter a phone number for Call tasks');
      return;
    }

    // Add phoneNumber to payload if necessary and supported by backend
    // if (this.taskType === 'Call') {
    //   updatedTaskPayload.phoneNumber = this.phoneNumber;
    // }

    if (this.taskToEdit && this.taskToEdit.id !== undefined) {
      this.taskService.updateTask(this.taskToEdit.id, updatedTaskPayload).subscribe({
        next: (responseTask: Task) => {
          console.log('Task updated successfully:', responseTask);
          this.taskUpdated.emit(responseTask);
          this.closeModal.emit();
        },
        error: (error: any) => {
          console.error('Error updating task:', error);
          alert('Error updating task. Please try again.');
        }
      });
    } else {
       // This should not happen if used correctly for editing
       console.error('Attempted to save edit without a taskToEdit');
       alert('Error: Task data not available for update.');
    }
  }

  toggleStatus(status: 'open' | 'closed'): void {
    this.status = status;
  }

  onTaskTypeChange(): void {
    if (this.taskType !== 'Call') {
      this.phoneNumber = '';
    }
  }

}
