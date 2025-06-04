import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService, Task } from '../task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filters: any = {};
  sortBy: string = 'created_date';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks(this.filters, this.sortBy, this.sortOrder)
      .subscribe(
        (data) => {
          this.tasks = data;
        },
        (error) => {
          console.error('Error fetching tasks:', error);
        }
      );
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
    console.log('Open new task modal');
  }

  editTask(task: Task): void {
    console.log('Edit task:', task);
  }

  deleteTask(taskId: number | undefined): void {
    if (taskId === undefined) return;
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe(
        () => {
          console.log('Task deleted successfully');
          this.loadTasks();
        },
        (error) => {
          console.error('Error deleting task:', error);
        }
      );
    }
  }

  updateTaskStatus(task: Task, status: 'open' | 'closed'): void {
     if (task.id === undefined) return;
     this.taskService.updateTaskStatus(task.id, status).subscribe(
        (updatedTask) => {
          console.log('Task status updated', updatedTask);
          const index = this.tasks.findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            this.tasks[index].status = updatedTask.status;
          }
        },
        (error) => {
          console.error('Error updating task status:', error);
        }
     );
  }

  formatDateTime(isoString: string, type: 'date' | 'time'): string {
    const date = new Date(isoString);
    if (type === 'date') {
      return date.toLocaleDateString(); // Format as date (e.g., MM/dd/yyyy)
    } else if (type === 'time') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Format as time (e.g., HH:MM AM/PM)
    }
    return date.toLocaleString(); // Default to full format if type is unknown
  }
}
