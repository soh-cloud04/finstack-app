import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-task-modal.component.html',
  styleUrls: ['./new-task-modal.component.css']
})
export class NewTaskModalComponent {

  // Output event to notify the parent component to close the modal
  @Output() closeModal = new EventEmitter<void>();

  // Properties to hold form data
  entityName: string = '';
  taskDate: string = '';
  taskHour: number = 12;
  taskMinute: number = 0;
  taskAmpm: 'AM' | 'PM' = 'PM';
  taskType: string = 'Call';
  phoneNumber: string = '';
  contactPerson: string = '';
  note: string = '';
  status: 'open' | 'closed' = 'open';

  constructor() { }

  // Method to close the modal (e.g., on Cancel button click or backdrop click)
  cancel(): void {
    this.closeModal.emit(); // Emit the closeModal event
  }

  save(): void {
    console.log('Modal saved');
    // TODO: Logic to save the new task using TaskService
    // After saving, emit this.closeModal.emit();
  }

  // Helper to generate hour/minute options for time pickers (will need implementation in HTML)
  getHours(): number[] {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }

  getMinutes(): number[] {
    return Array.from({ length: 60 }, (_, i) => i);
  }

  // Method to toggle status button
  toggleStatus(status: 'open' | 'closed'): void {
    this.status = status;
  }
} 