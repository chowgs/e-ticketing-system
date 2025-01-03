import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ClientComponent } from './home/client/client.component';
import { UserManagementComponent } from './home/user-management/user-management.component';
import { OfficeManagementComponent } from './home/office-management/office-management.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { JobRequestComponent } from './supervisor-home/job-request/job-request.component';
import { TaskComponent } from './home/task/task.component';
import { LogComponent } from './home/log/log.component';
import { MonitorComponent } from './home/monitor/monitor.component';
import { ItSupervisorComponent } from './supervisor-home/it-supervisor/it-supervisor.component';
import { UserSettingsComponent } from './home/user-settings/user-settings.component';
import { LoginGuard } from './services/login.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate:[LoginGuard] },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
    {
        path: '',
        component: HomeComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent, data:{ permission: 0}},
            { path: 'user-management', component: UserManagementComponent, data: {permission: 1.7} },
            { path: 'user-settings', component: UserSettingsComponent, data: {permission: 1.7}},
            { path: 'office-management', component: OfficeManagementComponent, data: {permission: 1.4} },
            { path: 'task', component: TaskComponent, data: {permission: 0} },
            { path: 'maintenance-log', component: LogComponent, data: {permission: 0} },
            { path: 'unassigned', component: MonitorComponent, data: {permission: 2.1} },
            { path: 'job-request', component: JobRequestComponent, data: {permission: 4.1}},
            { path: 'it-supervisor', component: ItSupervisorComponent, data: {permission: 3.1}},
        ],
    },
    { path: 'client', component: ClientComponent, canActivate:[LoginGuard] },
];
