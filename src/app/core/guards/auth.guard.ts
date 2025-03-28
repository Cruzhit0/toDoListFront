import { inject } from "@angular/core"
import { Router } from "@angular/router"
import { AuthService } from "../services/auth.service"

export const authGuard = () => {
  const router = inject(Router)
  const authService = inject(AuthService)

  if (authService.isAuthenticated()) {
    return true
  }

  // Redirect to login page
  return router.createUrlTree(["/auth/login"])
}
