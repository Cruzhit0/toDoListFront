import { Component, Inject, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { MatButtonModule } from "@angular/material/button"
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { MatIconModule } from "@angular/material/icon"
import type { Task } from "../../../core/models/task.model"
import { animate, style, transition, trigger } from "@angular/animations"

interface DialogData {
  mode: "create" | "edit"
  task?: Task
}

@Component({
  selector: "app-task-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("300ms ease-in", style({ opacity: 1 })),
      ]),
      transition(":leave", [
        animate("300ms ease-out", style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class TaskFormComponent {
  taskForm!: FormGroup

  private fb = inject(FormBuilder)
  private dialogRef = inject(MatDialogRef<TaskFormComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit() {
    this.initForm()
  }

  private initForm() {
    const task = this.data.task

    this.taskForm = this.fb.group({
      title: [task?.title || "", Validators.required],
      description: [task?.description || ""],
      dueDate: [task?.dueDate ? new Date(task.dueDate) : new Date(), Validators.required],
    })
  }

  onSubmit() {
    if (this.taskForm.invalid) return

    const formValue = this.taskForm.value

    // Format date to ISO string
    const taskData = {
      ...formValue,
      dueDate: formValue.dueDate.toISOString(),
    }

    this.dialogRef.close(taskData)
  }

  onCancel() {
    this.dialogRef.close()
  }
}

