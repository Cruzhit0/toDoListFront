import type { SubTask } from "./subtask.model"

export interface TaskResponse {
  id: number
  title: string
  description: string
  dueDate: string
  userId: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Task  extends TaskResponse {
    subtasks?: SubTask[] 
  }

