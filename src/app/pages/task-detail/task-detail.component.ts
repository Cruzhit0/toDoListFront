import { Component, OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatDialog, MatDialogModule } from "@angular/material/dialog"
import { TaskService } from "../../core/services/task.service"
import { switchMap, tap, catchError, map } from "rxjs/operators"
import { EMPTY, Observable, of } from "rxjs"
import { Task } from "../../core/models/task.model"
import { SubTask } from "../../core/models/subtask.model"
import { TaskFormComponent } from "../components/task-form/task-form.component"
import { PremiumCheckboxComponent } from "../components/premium-checkbox/premium-checkbox.component"

@Component({
  selector: "app-task-detail-page",
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatDialogModule, PremiumCheckboxComponent],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private taskService = inject(TaskService)
  private dialog = inject(MatDialog)

  // Change to Observable<Task | null>
  task$!: Observable<Task | null>

  ngOnInit(): void {
    this.loadTask()
  }

  private loadTask(): void {
    this.task$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = Number(params.get("id"))
        
        // Handle case where id might be NaN
        if (isNaN(id)) {
          this.router.navigate(["/tasks"])
          return of(null)
        }

        return this.taskService.tasks$.pipe(
          map((tasks) => tasks.find((task) => task.id === id) || null),
          tap((task) => {
            if (!task) {
              this.router.navigate(["/tasks"])
            }
          }),
          catchError((err) => {
            console.error("Error loading task", err)
            this.router.navigate(["/tasks"])
            return of(null)
          })
        )
      })
    )
  }

  goBack(): void {
    this.router.navigate(["/tasks"])
  }

  editTask(): void {
    this.task$
      .pipe(
        switchMap((task) => {
          if (!task) return EMPTY

          const dialogRef = this.dialog.open(TaskFormComponent, {
            width: "500px",
            panelClass: "task-dialog",
            data: { mode: "edit", task },
          })

          return dialogRef.afterClosed()
        }),
        switchMap((result) => {
          if (!result) return EMPTY

          return this.task$.pipe(
            switchMap((task) => {
              if (!task) return EMPTY
              return this.taskService.updateTask(task.id, result)
            })
          )
        })
      )
      .subscribe()
  }

  deleteTask(): void {
    if (confirm("Are you sure you want to delete this task?")) {
      this.task$
        .pipe(
          switchMap((task) => {
            if (!task) return EMPTY
            return this.taskService.deleteTask(task.id)
          })
        )
        .subscribe({
          next: () => {
            this.router.navigate(["/tasks"])
          },
          error: (error) => {
            console.error("Error deleting task", error)
          },
        })
    }
  }

  toggleSubtask(subtaskId: number): void {
    this.taskService.toggleSubtaskCompletion(subtaskId).subscribe({
      error: (error) => {
        console.error("Error toggling subtask", error)
      },
    })
  }

  addSubtask(): void {
    this.task$.pipe(
      switchMap((task) => {
        if (!task) return EMPTY

        const subtask: Partial<SubTask> = {
          description: "New subtask",
          isCompleted: false,
          taskId: task.id,
        }

        return this.taskService.createSubtask(subtask)
      })
    ).subscribe({
      error: (error) => {
        console.error("Error creating subtask", error)
      },
    })
  }
}