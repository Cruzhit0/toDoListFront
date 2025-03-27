import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  MAT_DIALOG_DATA, 
  MatDialogRef, 
  MatDialogModule 
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-subtask-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  templateUrl: './subtask-form.component.html',
  styleUrl: './subtask-form.component.css'
})
export class SubtaskFormComponent {
  subtaskDescription: string = '';

  constructor(
    public dialogRef: MatDialogRef<SubtaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { taskId: number }
  ) {}

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onAdd(): void {
    if (this.subtaskDescription?.trim()) {
      this.dialogRef.close({
        description: this.subtaskDescription.trim(),
        taskId: this.data.taskId
      });
    }
  }
}