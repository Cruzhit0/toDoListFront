import { Component, Input, Output, EventEmitter, HostListener, ElementRef, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { MatProgressBarModule } from "@angular/material/progress-bar"
import { MatMenuModule } from "@angular/material/menu"
import { MatRippleModule } from "@angular/material/core"
import type { Task } from "../../../core/models/task.model"
import { animate, state, style, transition, trigger } from "@angular/animations"
import { TaskService } from "../../../core/services/task.service"

@Component({
  selector: "app-task-card",
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatMenuModule, MatRippleModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
  animations: [
    trigger("cardExpand", [
      state(
        "collapsed",
        style({
          height: "*",
        }),
      ),
      state(
        "expanded",
        style({
          height: "*",
        }),
      ),
      transition("collapsed <=> expanded", [animate("300ms cubic-bezier(0.4, 0.0, 0.2, 1)")]),
    ]),
  ],
})
export class TaskCardComponent {
  @Input() task!: Task
  @Output() onEdit = new EventEmitter<Task>()
  @Output() onDelete = new EventEmitter<Task>()
  @Output() onDuplicate = new EventEmitter<Task>()
  @Output() onArchive = new EventEmitter<Task>()
  @Output() onClick = new EventEmitter<Task>()

  expanded = false
  transform = "rotateY(0deg) rotateX(0deg)"

  private taskService = inject(TaskService)
  private el = inject(ElementRef)

  @HostListener("click")
  toggleExpand() {
    this.expanded = !this.expanded
    this.onClick.emit(this.task)
  }

  @HostListener("mousemove", ["$event"])
  onMouseMove(event: MouseEvent) {
    // 3D tilt effect
    const rect = this.el.nativeElement.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateY = ((x - centerX) / centerX) * 5 // Max 5 degrees
    const rotateX = ((centerY - y) / centerY) * 5 // Max 5 degrees

    this.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`
  }

  @HostListener("mouseleave")
  onMouseLeave() {
    // Reset transform
    this.transform = "rotateY(0deg) rotateX(0deg)"
  }

  getDueDateClass() {
    const today = new Date()
    const dueDate = new Date(this.task.dueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return "bg-red-500" // Overdue
    } else if (diffDays <= 2) {
      return "bg-orange-500" // Due soon
    } else if (diffDays <= 7) {
      return "bg-yellow-500" // Due this week
    } else {
      return "bg-green-500" // Due later
    }
  }

  getCompletedSubtasksCount() {
    return this.task.subtasks.filter((subtask) => subtask.isCompleted).length
  }

  getProgressPercentage() {
    if (this.task.subtasks.length === 0) return 0
    return Math.round((this.getCompletedSubtasksCount() / this.task.subtasks.length) * 100)
  }

  getProgressBarClass() {
    const percentage = this.getProgressPercentage()

    if (percentage === 100) {
      return "bg-green-500 dark:bg-green-400"
    } else if (percentage >= 75) {
      return "bg-blue-500 dark:bg-blue-400"
    } else if (percentage >= 50) {
      return "bg-yellow-500 dark:bg-yellow-400"
    } else if (percentage >= 25) {
      return "bg-orange-500 dark:bg-orange-400"
    } else {
      return "bg-red-500 dark:bg-red-400"
    }
  }

  getProgressTextClass() {
    const percentage = this.getProgressPercentage()

    if (percentage === 100) {
      return "text-green-600 dark:text-green-400"
    } else if (percentage >= 75) {
      return "text-blue-600 dark:text-blue-400"
    } else if (percentage >= 50) {
      return "text-yellow-600 dark:text-yellow-400"
    } else if (percentage >= 25) {
      return "text-orange-600 dark:text-orange-400"
    } else {
      return "text-red-600 dark:text-red-400"
    }
  }
}

