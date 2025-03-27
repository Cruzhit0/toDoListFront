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
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
    mode: "create" | "edit"; task?: Task 
}
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.data?.task) {
      this.taskForm.patchValue({
        title: this.data.task.title,
        description: this.data.task.description,
        dueDate: new Date(this.data.task.dueDate)
      });
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const taskData = {
        ...formValue,
        dueDate: new Date(formValue.dueDate).toISOString()
      };
      
      this.dialogRef.close(taskData);
    }
  }

  onCancel() {
    this.dialogRef.close()
  }
}

