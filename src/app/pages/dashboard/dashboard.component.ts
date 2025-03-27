import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { TaskService } from "../../core/services/task.service"
import { AuthService } from "../../core/services/auth.service"

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [   
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
   ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  taskCount = 0
  completedTaskCount = 0
  pendingTaskCount = 0

  private taskService = inject(TaskService)
  private authService = inject(AuthService)

  ngOnInit(): void {
    this.loadTaskStats()
  }

  private loadTaskStats(): void {
    this.taskService.tasks$.subscribe((tasks) => {
      this.taskCount = tasks.length
      this.completedTaskCount = tasks.filter(
        (task) => task.subtasks && task.subtasks.length > 0 && task.subtasks.every((subtask) => subtask.isCompleted),
      ).length
      this.pendingTaskCount = this.taskCount - this.completedTaskCount
    })

    // Load tasks if not already loaded
    if (this.taskCount === 0) {
      const userId = this.authService.getCurrentUserId()
      this.taskService.loadTasks(userId).subscribe()
    }
  }
}