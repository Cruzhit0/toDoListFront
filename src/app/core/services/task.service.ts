import { Injectable, inject } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, of, throwError,map, forkJoin } from "rxjs"
import { catchError, tap,switchMap } from "rxjs/operators"
import  { Task,TaskResponse } from "../models/task.model"
import type { SubTask } from "../models/subtask.model"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class TaskService {
  private http = inject(HttpClient)
  private apiUrl = environment.apiUrl

  private tasksSubject = new BehaviorSubject<Task[]>([])
  tasks$ = this.tasksSubject.asObservable()

  private offlineChanges: any[] = []
  private isOnline = navigator.onLine

  constructor() {
    window.addEventListener("online", () => {
      this.isOnline = true
      this.syncOfflineChanges()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
    })

    // Load tasks from local storage if offline
    this.loadFromLocalStorage()
  }

  // Get all tasks for the current user
  
  loadTasks(userId: number): Observable<Task[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/api/task/user/${userId}`).pipe(
      switchMap(tasks => {
        const subtaskRequests = tasks.map(task => 
          this.http.get<SubTask[]>(`${this.apiUrl}/api/subtask/task/${task.id}`).pipe(
            map(subtasks => ({
              ...task,
              subtasks: subtasks || []
            }))
          )
        );
        console.log("Subtask requests:", subtaskRequests)
        // Wait for all subtask requests to complete
        return forkJoin(subtaskRequests);
      }),
      tap(tasksWithSubtasks => {
        this.tasksSubject.next(tasksWithSubtasks);
      }),
      catchError(error => {
        console.error("Error loading tasks", error);
        throw error;
      })
    );
  }


  // Create a new task
  createTask(task: Partial<Task>): Observable<Task> {
    if (!this.isOnline) {
      return this.handleOfflineCreate(task)
    }

    return this.http.post<Task>(`${this.apiUrl}/api/task/`, task).pipe(
      tap((newTask) => {
        const currentTasks = this.tasksSubject.value
        this.tasksSubject.next([...currentTasks, newTask])
        localStorage.setItem("tasks", JSON.stringify(this.tasksSubject.value))
      }),
      catchError((error) => {
        console.error("Error creating task", error)
        return throwError(() => error)
      }),
    )
  }

  // Update an existing task
  updateTask(taskId: number, updates: Partial<Task>): Observable<Task> {
    if (!this.isOnline) {
      return this.handleOfflineUpdate(taskId, updates)
    }

    return this.http.put<Task>(`${this.apiUrl}/api/task/${taskId}`, updates).pipe(
      tap((updatedTask) => {
        const currentTasks = this.tasksSubject.value
        const index = currentTasks.findIndex((t) => t.id === taskId)

        if (index !== -1) {
          const updatedTasks = [...currentTasks]
          updatedTasks[index] = { ...currentTasks[index], ...updatedTask }
          this.tasksSubject.next(updatedTasks)
          localStorage.setItem("tasks", JSON.stringify(updatedTasks))
        }
      }),
      catchError((error) => {
        console.error("Error updating task", error)
        return throwError(() => error)
      }),
    )
  }

  // Delete a task
  deleteTask(taskId: number): Observable<void> {
    if (!this.isOnline) {
      return this.handleOfflineDelete(taskId)
    }

    return this.http.delete<void>(`${this.apiUrl}/api/task/${taskId}`).pipe(
      tap(() => {
        const currentTasks = this.tasksSubject.value
        this.tasksSubject.next(currentTasks.filter((t) => t.id !== taskId))
        localStorage.setItem("tasks", JSON.stringify(this.tasksSubject.value))
      }),
      catchError((error) => {
        console.error("Error deleting task", error)
        return throwError(() => error)
      }),
    )
  }

  // Create a subtask
  createSubtask(subtask: Partial<SubTask>): Observable<SubTask> {
    if (!this.isOnline) {
      return this.handleOfflineSubtaskCreate(subtask)
    }

    return this.http.post<SubTask>(`${this.apiUrl}/api/subtask/`, subtask).pipe(
      tap((newSubtask) => {
        const currentTasks = this.tasksSubject.value
        const taskIndex = currentTasks.findIndex((t) => t.id === newSubtask.taskId)

        if (taskIndex !== -1) {
          const updatedTasks = [...currentTasks]
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            subtasks: [...(updatedTasks[taskIndex].subtasks || []), newSubtask],
          }

          this.tasksSubject.next(updatedTasks)
          localStorage.setItem("tasks", JSON.stringify(updatedTasks))
        }
      }),
      catchError((error) => {
        console.error("Error creating subtask", error)
        return throwError(() => error)
      }),
    )
  }

  // Toggle subtask completion
  toggleSubtaskCompletion(subtaskId: number): Observable<SubTask> {
    if (!this.isOnline) {
      return this.handleOfflineSubtaskToggle(subtaskId)
    }

    return this.http.patch<SubTask>(`${this.apiUrl}/api/subtask/${subtaskId}/toggle`, {}).pipe(
        tap((updatedSubtask) => {
          const currentTasks = this.tasksSubject.value;
          const taskIndex = currentTasks.findIndex((t) => 
            t.subtasks && t.subtasks.some((s) => s.id === subtaskId)
          );
    
          if (taskIndex !== -1) {
            const updatedTasks = [...currentTasks];
            const task = updatedTasks[taskIndex];
    
            // Ensure subtasks exist and is an array
            if (task.subtasks) {
              const subtaskIndex = task.subtasks.findIndex((s) => s.id === subtaskId);
    
              if (subtaskIndex !== -1) {
                // Create a new array of subtasks to maintain immutability
                const updatedSubtasks = [...task.subtasks];
                updatedSubtasks[subtaskIndex] = updatedSubtask;
    
                // Create a new task object with updated subtasks
                updatedTasks[taskIndex] = {
                  ...task,
                  subtasks: updatedSubtasks
                };
    
                this.tasksSubject.next(updatedTasks);
                localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    
                // Check if all subtasks are completed
                this.checkTaskCompletion(updatedTasks[taskIndex]);
              }
            }
          }
        }),
        catchError((error) => {
          console.error("Error toggling subtask", error);
          return throwError(() => error);
        })
      );
    }

  // Sync offline changes when back online
  syncOfflineChanges(): void {
    if (!this.isOnline || this.offlineChanges.length === 0) return

    console.log("Syncing offline changes:", this.offlineChanges.length)

    // Process each change in order
    const processChanges = async () => {
      for (const change of this.offlineChanges) {
        try {
          await this.processOfflineChange(change)
        } catch (error) {
          console.error("Error processing offline change", change, error)
        }
      }

      // Clear offline changes after processing
      this.offlineChanges = []
      localStorage.removeItem("offlineChanges")
    }

    processChanges()
  }

  // Check if all subtasks are completed and trigger celebration
  private checkTaskCompletion(task: Task): void {
    if (task.subtasks && task.subtasks.length > 0) {
      const allCompleted = task.subtasks.every((s) => s.isCompleted)

      if (allCompleted) {
        // Trigger celebration event
        this.triggerCelebration(task.id)
      }
    }
  }

  // Trigger celebration animation
  private triggerCelebration(taskId: number): void {
    // This would be implemented with an event service
    console.log("Task completed! Celebration for task:", taskId)

    // Play completion sound
    this.playCompletionSound()
  }

  // Play sound effect for task completion
  private playCompletionSound(): void {
    const audio = new Audio("assets/sounds/task-complete.mp3")
    audio.volume = 0.5
    audio.play().catch((e) => console.log("Audio playback prevented:", e))
  }

  // Handle offline operations
  private handleOfflineCreate(task: Partial<Task>): Observable<Task> {
    const tempId = Date.now()
    const newTask = {
      ...task,
      id: tempId,
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Task

    const currentTasks = this.tasksSubject.value
    this.tasksSubject.next([...currentTasks, newTask])

    this.offlineChanges.push({
      type: "CREATE_TASK",
      data: task,
      tempId,
    })

    localStorage.setItem("tasks", JSON.stringify(this.tasksSubject.value))
    localStorage.setItem("offlineChanges", JSON.stringify(this.offlineChanges))

    return of(newTask)
  }

  private handleOfflineUpdate(taskId: number, updates: Partial<Task>): Observable<Task> {
    const currentTasks = this.tasksSubject.value
    const index = currentTasks.findIndex((t) => t.id === taskId)

    if (index === -1) {
      return throwError(() => new Error("Task not found"))
    }

    const updatedTask = { ...currentTasks[index], ...updates, updatedAt: new Date().toISOString() }
    const updatedTasks = [...currentTasks]
    updatedTasks[index] = updatedTask

    this.tasksSubject.next(updatedTasks)

    this.offlineChanges.push({
      type: "UPDATE_TASK",
      taskId,
      data: updates,
    })

    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
    localStorage.setItem("offlineChanges", JSON.stringify(this.offlineChanges))

    return of(updatedTask)
  }

  private handleOfflineDelete(taskId: number): Observable<void> {
    const currentTasks = this.tasksSubject.value
    this.tasksSubject.next(currentTasks.filter((t) => t.id !== taskId))

    this.offlineChanges.push({
      type: "DELETE_TASK",
      taskId,
    })

    localStorage.setItem("tasks", JSON.stringify(this.tasksSubject.value))
    localStorage.setItem("offlineChanges", JSON.stringify(this.offlineChanges))

    return of(undefined)
  }

  private handleOfflineSubtaskCreate(subtask: Partial<SubTask>): Observable<SubTask> {
    const tempId = Date.now()
    const newSubtask = {
      ...subtask,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as SubTask

    const currentTasks = this.tasksSubject.value
    const taskIndex = currentTasks.findIndex((t) => t.id === subtask.taskId)

    if (taskIndex === -1) {
      return throwError(() => new Error("Task not found"))
    }

    const updatedTasks = [...currentTasks]
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      subtasks: [...(updatedTasks[taskIndex].subtasks || []), newSubtask],
    }

    this.tasksSubject.next(updatedTasks)

    this.offlineChanges.push({
      type: "CREATE_SUBTASK",
      data: subtask,
      tempId,
    })

    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
    localStorage.setItem("offlineChanges", JSON.stringify(this.offlineChanges))

    return of(newSubtask)
  }

  private handleOfflineSubtaskToggle(subtaskId: number): Observable<SubTask> {
    const currentTasks = this.tasksSubject.value
    let updatedSubtask: SubTask | null = null

    const updatedTasks = currentTasks.map((task) => {
      if (!task.subtasks) return task

      const subtaskIndex = task.subtasks.findIndex((s) => s.id === subtaskId)
      if (subtaskIndex === -1) return task

      const newSubtasks = [...task.subtasks]
      newSubtasks[subtaskIndex] = {
        ...newSubtasks[subtaskIndex],
        isCompleted: !newSubtasks[subtaskIndex].isCompleted,
        updatedAt: new Date().toISOString(),
      }

      updatedSubtask = newSubtasks[subtaskIndex]

      return {
        ...task,
        subtasks: newSubtasks,
      }
    })

    if (!updatedSubtask) {
      return throwError(() => new Error("Subtask not found"))
    }

    this.tasksSubject.next(updatedTasks)

    this.offlineChanges.push({
      type: "TOGGLE_SUBTASK",
      subtaskId,
    })

    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
    localStorage.setItem("offlineChanges", JSON.stringify(this.offlineChanges))

    // Check if all subtasks are completed
    const task = updatedTasks.find((t) => t.subtasks && t.subtasks.some((s) => s.id === subtaskId))

    if (task) {
      this.checkTaskCompletion(task)
    }

    return updatedSubtask;
  }

  private async processOfflineChange(change: any): Promise<void> {
    switch (change.type) {
      case "CREATE_TASK":
        await this.http.post(`${this.apiUrl}/api/task/`, change.data).toPromise()
        break

      case "UPDATE_TASK":
        await this.http.put(`${this.apiUrl}/api/task/${change.taskId}`, change.data).toPromise()
        break

      case "DELETE_TASK":
        await this.http.delete(`${this.apiUrl}/api/task/${change.taskId}`).toPromise()
        break

      case "CREATE_SUBTASK":
        await this.http.post(`${this.apiUrl}/api/subtask/`, change.data).toPromise()
        break

      case "TOGGLE_SUBTASK":
        await this.http.patch(`${this.apiUrl}/api/subtask/${change.subtaskId}/toggle`, {}).toPromise()
        break
    }
  }

  // Load tasks from local storage when offline
  private loadFromLocalStorage(): void {
    const storedTasks = localStorage.getItem("tasks")
    if (storedTasks) {
      try {
        const tasks = JSON.parse(storedTasks)
        this.tasksSubject.next(tasks)
      } catch (error) {
        console.error("Error parsing stored tasks", error)
      }
    }

    const storedChanges = localStorage.getItem("offlineChanges")
    if (storedChanges) {
      try {
        this.offlineChanges = JSON.parse(storedChanges)
      } catch (error) {
        console.error("Error parsing stored changes", error)
      }
    }
  }
}

