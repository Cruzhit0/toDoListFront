import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
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
//   {
//     path: "tasks/:id",
//     loadComponent: () =>
//       import("./pages/task-detail/task-detail-page.component").then((m) => m.TaskDetailPageComponent),
//     // canActivate: [authGuard],
//   },

];