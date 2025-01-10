import { Routes } from "@angular/router";
import { LoginGuard } from "./services/login.guard";
import { AuthGuard } from "./services/auth.guard";

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
                path: 'dashboard',
                loadComponent: () => import('./home/dashboard/dashboard.component'). then(m => m.DashboardComponent),
            },
            {
                path: 'user-management',
                loadComponent: () => import('./home/user-management/user-management.component'). then(m => m.UserManagementComponent),
            },
            {
                path: 'user-settings',
                loadComponent: () => import('./home/user-settings/user-settings.component'). then(m => m.UserSettingsComponent),
            },
            {
                path: 'office-management',
                loadComponent: () => import('./home/office-management/office-management.component'). then(m => m.OfficeManagementComponent),
            },
            {
                path: 'task',
                loadComponent: () => import('./home/task/task.component'). then(m => m.TaskComponent),
            },
            {
                path: 'maintenance-log',
                loadComponent: () => import('./home/log/log.component'). then(m => m.LogComponent),
            },
            {
                path: 'monitoring',
                loadComponent: () => import('./home/monitor/monitor.component'). then(m => m.MonitorComponent),
            },
            {
                path: 'supervisor/technical-supervisor',
                loadComponent: () => import('./supervisor-home/it-supervisor/it-supervisor.component'). then(m => m.ItSupervisorComponent),
            },
            {
                path: 'supervisor/head-supervisor',
                loadComponent: () => import('./supervisor-home/job-request/job-request.component'). then(m => m.JobRequestComponent),
            },
        ]
    },
    
]