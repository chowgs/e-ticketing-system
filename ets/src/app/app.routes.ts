import { Routes } from "@angular/router";
import { LoginGuard } from "./services/login.guard";
import { AuthGuard } from "./services/auth.guard";
import { PermissionGuard } from "./services/permission.guard";
import { AccessDeniedComponent } from "./home/access-denied/access-denied.component";

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: 'client',
        canMatch: [LoginGuard],
        loadComponent: () => import('./home/client/client.component'). then(m => m.ClientComponent)
    },
    {
        path: '',
        canMatch: [AuthGuard],
        loadComponent: () => import('./home/home.component'). then(m => m.HomeComponent),
        children: [
            {
                path: 'dashboard', // if permission has 2.2 ex: [1.9,2.2]
                loadComponent: () => import('./home/dashboard/dashboard.component'). then(m => m.DashboardComponent),
                data: { requiredPermission: 2.2 },
                canActivate: [PermissionGuard],
            },
            {
                path: 'user-settings', // if permission has 1.6 ex: [1.9,1.6]
                loadComponent: () => import('./home/user-settings/user-settings.component'). then(m => m.UserSettingsComponent),
                canActivate: [PermissionGuard],
                data: { requiredPermission: 1.6 },
            },
            {
                path: 'task', // if permission has 1.9 ex: [1.9,2.2]
                loadComponent: () => import('./home/task/task.component'). then(m => m.TaskComponent),
                data: { requiredPermission: 1.9 },
                canActivate: [PermissionGuard],
            },
            {
                path: 'maintenance-log', // if permission has 2.3 ex: [2.3,2.2]
                loadComponent: () => import('./home/log/log.component'). then(m => m.LogComponent),
                data: { requiredPermission: 2.3 },
                canActivate: [PermissionGuard],
            },
            {
                path: 'monitoring', // if permission has 2.1 ex: [2.1,2.2]
                loadComponent: () => import('./home/monitor/monitor.component'). then(m => m.MonitorComponent),
                data: { requiredPermission: 2.1 },
                canActivate: [PermissionGuard],
            },
            {
                path: 'technical-supervisor', // if permission has 3.1 ex: [3.1, 2.2]
                loadComponent: () => import('./supervisor-home/it-supervisor/it-supervisor.component'). then(m => m.ItSupervisorComponent),
                data: { requiredPermission: 3.1 },
                canActivate: [PermissionGuard],
            },
            {
                path: 'head-supervisor', // if permission has 4.1 ex: [1.2, 4.1, 3.1]
                loadComponent: () => import('./supervisor-home/job-request/job-request.component'). then(m => m.JobRequestComponent),
                data: { requiredPermission: 4.1 },
                canActivate: [PermissionGuard],
            },
            { path: 'access-denied', component: AccessDeniedComponent },
        ]
    },

    
]