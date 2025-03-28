import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
        path: "dashboard",
        loadComponent: () => import("./pages/dashboard/dashboard.component").then((m) => m.DashboardComponent),
        // canActivate: [authGuard],
      },
      {
        path: "tasks",
        loadComponent: () => import("./pages/task/task.component").then((m) => m.TaskComponent),
        // canActivate: [authGuard],
      },

        {
            path: "tasks/:id",
            loadComponent: () =>
            import("./pages/task-detail/task-detail.component").then((m) => m.TaskDetailComponent),
            // canActivate: [authGuard],
        },

];