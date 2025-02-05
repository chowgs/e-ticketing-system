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
                path: 'dashboard', // permission should contain 2.2 
                loadComponent: () => import('./home/dashboard/dashboard.component'). then(m => m.DashboardComponent),
            },
            {
                path: 'user-settings', // permission should contain 1.6 
                loadComponent: () => import('./home/user-settings/user-settings.component'). then(m => m.UserSettingsComponent),
            },
            {
                path: 'task', // permission should contain 1.9
                loadComponent: () => import('./home/task/task.component'). then(m => m.TaskComponent),
            },
            {
                path: 'maintenance-log', // permission should contain 2.3
                loadComponent: () => import('./home/log/log.component'). then(m => m.LogComponent),
            },
            {
                path: 'monitoring', // permission should contain 2.1
                loadComponent: () => import('./home/monitor/monitor.component'). then(m => m.MonitorComponent),
            },
            {
                path: 'technical-supervisor', // permission should contain 3.1
                loadComponent: () => import('./supervisor-home/it-supervisor/it-supervisor.component'). then(m => m.ItSupervisorComponent),
            },
            {
                path: 'head-supervisor', // permission should contain 4.1
                loadComponent: () => import('./supervisor-home/job-request/job-request.component'). then(m => m.JobRequestComponent),
            },
        ]
    },
    
]