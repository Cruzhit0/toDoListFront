import { Component, type OnInit, ViewChild, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatDialog, MatDialogModule } from "@angular/material/dialog"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { Router, RouterModule } from "@angular/router"
import { TaskService } from "../../core/services/task.service"
import { AuthService } from "../../core/services/auth.service"
import type { Task } from "../../core/models/task.model"
import { TaskCardComponent } from "../components/task-card/task-card.component"
import { TaskFormComponent } from "../components/task-form/task-form.component"
import { RadialMenuComponent } from "../components/radial-menu/radial-menu.component"

@Component({
  selector: "app-tasks",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    RouterModule,
    TaskCardComponent,
    RadialMenuComponent,
  ],
  templateUrl: "./task.component.html",
  styleUrls: ["./task.component.css"],
})

export class TaskComponent implements OnInit {
  tasks: Task[] = []
  selectedTask: Task | null = null

  private taskService = inject(TaskService)
  private authService = inject(AuthService)
  private dialog = inject(MatDialog)
  private router = inject(Router)

  @ViewChild("radialMenu") radialMenu!: RadialMenuComponent

  ngOnInit() {
    this.loadTasks()

    // Subscribe to task updates
    this.taskService.tasks$.subscribe((tasks) => {
      this.tasks = tasks
    })
  }

  private loadTasks() {
    const userId = this.authService.getCurrentUserId()
    this.taskService.loadTasks(userId).subscribe({
      error: (error) => {
        console.error("Error loading tasks", error)
      },
    })
  }

  getCompletedTasksCount(): number {
    return this.tasks.filter((task) => {
      if (!task.subtasks || task.subtasks.length === 0) return false
      return task.subtasks.every((subtask) => subtask.isCompleted)
    }).length
  }

  openNewTaskDialog() {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: "500px",
      panelClass: "task-dialog",
      data: { mode: "create" },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.createTask(result).subscribe({
          error: (error) => {
            console.error("Error creating task", error)
          },
        })
      }
    })
  }

  openEditDialog(task: Task) {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: "500px",
      panelClass: "task-dialog",
      data: { mode: "edit", task },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.updateTask(task.id, result).subscribe({
          error: (error) => {
            console.error("Error updating task", error)
          },
        })
      }
    })
  }

  deleteTask(task: Task) {
    if (confirm("Are you sure you want to delete this task?")) {
      this.taskService.deleteTask(task.id).subscribe({
        error: (error) => {
          console.error("Error deleting task", error)
        },
      })
    }
  }

  duplicateTask(task: Task) {
    const newTask = {
      ...task,
      id: undefined,
      title: `${task.title} (Copy)`,
      subtasks: [],
    }

    this.taskService.createTask(newTask).subscribe({
      error: (error) => {
        console.error("Error duplicating task", error)
      },
    })
  }

  archiveTask(task: Task) {
    // This would be implemented with an archive flag
    console.log("Archive task:", task)
  }

  navigateToTaskDetail(task: Task) {
    this.router.navigate(["/tasks", task.id])
  }

  openRadialMenu(event: MouseEvent, task: Task) {
    event.preventDefault()
    this.selectedTask = task

    this.radialMenu.items = [
      { icon: "edit", label: "Edit", action: "edit", color: "#3B82F6" },
      { icon: "content_copy", label: "Duplicate", action: "duplicate", color: "#10B981" },
      { icon: "archive", label: "Archive", action: "archive", color: "#F59E0B" },
      { icon: "delete", label: "Delete", action: "delete", color: "#EF4444" },
    ]

    this.radialMenu.show(event.clientX, event.clientY)
  }

  handleRadialMenuAction(action: string) {
    if (!this.selectedTask) return

    switch (action) {
      case "edit":
        this.openEditDialog(this.selectedTask)
        break
      case "duplicate":
        this.duplicateTask(this.selectedTask)
        break
      case "archive":
        this.archiveTask(this.selectedTask)
        break
      case "delete":
        this.deleteTask(this.selectedTask)
        break
    }
  }
}

