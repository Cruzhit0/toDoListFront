export interface User {
    id: number
    email: string
    name?: string
    avatarUrl?: string
    createdAt: string
    updatedAt: string
  }
  
    export interface AuthResponse {
        token: string
    }  