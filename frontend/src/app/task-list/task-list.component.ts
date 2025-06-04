import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../task.service';
import { NewTaskModalComponent } from '../new-task-modal/new-task-modal.component';
import { EditTaskModalComponent } from '../edit-task-modal/edit-task-modal.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NewTaskModalComponent, EditTaskModalComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filters: any = {};
  sortBy: string = 'created_date';
  sortOrder: 'asc' | 'desc' = 'desc';
  showNewTaskModal: boolean = false;
  showEditTaskModal: boolean = false;
  taskToEdit: Task | null = null;
  activeOptionsDropdownId: number | null = null;

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks(this.filters, this.sortBy, this.sortOrder)
      .subscribe({
        next: (data: Task[]) => {
          this.tasks = data;
        },
        error: (error: any) => {
          console.error('Error fetching tasks:', error);
        }
      });
  }

  applyFilters(): void {
    this.loadTasks();
  }

  changeSort(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'asc';
    }
    this.loadTasks();
  }

  openNewTaskModal(): void {
    this.taskToEdit = null;
    this.showNewTaskModal = true;
  }

  closeNewTaskModal(): void {
    this.showNewTaskModal = false;
    this.loadTasks();
  }

  openEditTaskModal(task: Task): void {
    this.taskToEdit = task;
    this.showEditTaskModal = true;
  }

  closeEditTaskModal(): void {
    this.showEditTaskModal = false;
    this.taskToEdit = null;
    this.loadTasks();
  }

  onTaskCreated(newTask: Task): void {
    this.tasks.unshift(newTask);
    this.showNewTaskModal = false;
  }

  onTaskUpdated(updatedTask: Task): void {
    const index = this.tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
    }
    this.showEditTaskModal = false;
    this.taskToEdit = null;
  }

  editTask(task: Task): void {
    this.openEditTaskModal(task);
  }

  deleteTask(taskId: number | undefined): void {
    if (taskId === undefined) return;
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          console.log('Task deleted successfully');
          this.loadTasks();
        },
        error: (error: any) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  updateTaskStatus(task: Task, status: 'open' | 'closed'): void {
    if (task.id === undefined) return;
    this.taskService.updateTaskStatus(task.id, status).subscribe({
      next: (updatedTask: Task) => {
        console.log('Task status updated', updatedTask);
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index].status = updatedTask.status;
        }
      },
      error: (error: any) => {
        console.error('Error updating task status:', error);
      }
    });
  }

  formatDateTime(isoString: string, type: 'date' | 'time'): string {
    const date = new Date(isoString);
    if (type === 'date') {
      return date.toLocaleDateString();
    } else if (type === 'time') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleString();
  }

  toggleOptionsDropdown(taskId: number | undefined): void {
    if (taskId === undefined) return;
    if (this.activeOptionsDropdownId === taskId) {
      this.activeOptionsDropdownId = null;
    } else {
      this.activeOptionsDropdownId = taskId;
    }
  }

  closeOptionsDropdown(): void {
    this.activeOptionsDropdownId = null;
  }
}
