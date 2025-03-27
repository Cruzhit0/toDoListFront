import type { Routes } from "@angular/router"
import { authGuard } from "./core/guards/auth.guard"

export const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },

 
  {
    path: "auth/login",
    loadComponent: () => import("./pages/login/login.component").then((m) => m.LoginComponent),
  },

  {
    path: "**",
    redirectTo: "dashboard",
  },
]
