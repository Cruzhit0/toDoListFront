import type { SubTask } from "./subtask.model"
import type { User } from "./user.model"

export interface Task {
  id: number
  title: string
  description: string
  dueDate: string
  userId: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  subtasks: SubTask[]
  collaborators?: User[]
}

