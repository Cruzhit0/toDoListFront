import { Injectable, inject } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, throwError } from "rxjs"
import { catchError, map, tap } from "rxjs/operators"
import type { User } from "../models/user.model"
import { environment } from "../../../environments/environment"
import { Router } from "@angular/router"

interface AuthResponse {
  token: string
  user: User
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient)
  private router = inject(Router)
  private apiUrl = environment.apiUrl

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage())
  currentUser$ = this.currentUserSubject.asObservable()

  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem("token"))
  token$ = this.tokenSubject.asObservable()

  constructor() {
    // Check token expiration on startup
    this.checkTokenExpiration()
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/login`, { email, password }).pipe(
      tap((response) => {
        this.setAuthData(response.token, response.user)
      }),
      map((response) => response.user),
      catchError((error) => {
        console.error("Login error", error)
        return throwError(() => new Error("Invalid credentials"))
      }),
    )
  }

  register(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/api/user/`, { email, password }).pipe(
      catchError((error) => {
        console.error("Registration error", error)
        return throwError(() => new Error("Registration failed"))
      }),
    )
  }

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("tokenExpiry")

    this.currentUserSubject.next(null)
    this.tokenSubject.next(null)

    this.router.navigate(["/auth/login"])
  }

  isAuthenticated(): boolean {
    const token = this.tokenSubject.value
    if (!token) return false

    // Check if token is expired
    const expiry = localStorage.getItem("tokenExpiry")
    if (!expiry) return false

    return new Date().getTime() < Number.parseInt(expiry, 10)
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }

  getCurrentUserId(): number {
    const user = this.getCurrentUser()
    return user ? user.id : 0
  }

  getToken(): string | null {
    return this.tokenSubject.value
  }

  isFirstTimeUser(): boolean {
    return localStorage.getItem("firstTimeVisit") !== "true"
  }

  markFirstTimeVisit(): void {
    localStorage.setItem("firstTimeVisit", "true")
    this.router.navigate(["/onboarding"])
  }

  private setAuthData(token: string, user: User): void {
    // Calculate token expiry (24 hours from now)
    const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000

    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    localStorage.setItem("tokenExpiry", expiryTime.toString())

    this.currentUserSubject.next(user)
    this.tokenSubject.next(token)
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem("user")
    if (!userJson) return null

    try {
      return JSON.parse(userJson)
    } catch (error) {
      console.error("Error parsing user from storage", error)
      return null
    }
  }

  private checkTokenExpiration(): void {
    const expiry = localStorage.getItem("tokenExpiry")
    if (!expiry) return

    const expiryTime = Number.parseInt(expiry, 10)
    const now = new Date().getTime()

    if (now >= expiryTime) {
      // Token expired, log out
      this.logout()
    } else {
      // Set up expiration timer
      const timeToExpiry = expiryTime - now
      setTimeout(() => this.logout(), timeToExpiry)
    }
  }
}

