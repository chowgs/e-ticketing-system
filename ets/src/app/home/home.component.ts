import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../shared/notification/notification.component';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, MatBadgeModule, CommonModule, NotificationComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userInfo: any = {
    name: '',
    permissions: [] // Initialize permissions as an array
  };

  isLoading: boolean = false;

  // Permission flags
  showItPersonnelSection: boolean = false;
  showDashboardSection: boolean = false;
  showPMSLogSection: boolean = false;
  showAdminSection: boolean = false;
  showMonitoringSection: boolean = false;
  showSupervisorSection: boolean = false;
  showItSupervisorSection: boolean = false;
  // showOfficeManagement: boolean = false;
  // showUserManagement: boolean = false;

  isLoggingOut: boolean = false; // Loading state for logout  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.authService.getUserPerms().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.isLoading = false;
          this.userInfo = response.data;
          this.userInfo.permissions = response.data.permissions || [];

          // this.showUserManagement = this.hasPermission(1.7);
          // this.showOfficeManagement = this.hasPermission(1.4); 
          // Evaluate permissions
          this.showItPersonnelSection = this.hasPermission(1.9);
          this.showAdminSection = this.hasPermission(1.6);
          this.showMonitoringSection = this.hasPermission(2.1);
          this.showDashboardSection = this.hasPermission(2.2);
          this.showPMSLogSection = this.hasPermission(2.3);
          this.showItSupervisorSection = this.hasPermission(3.1);
          this.showSupervisorSection = this.hasPermission(4.1);

        } else {
          console.error('Failed to retrieve user info');
        }
      },
      (error) => {
        console.error('Error fetching user info', error);
      }
    );
  }

  hasPermission(permission: number): boolean {
    return this.userInfo.permissions.includes(permission);
  }

  logout(): void {
    this.isLoggingOut = true; // Set loading state to true
    this.authService.logout().subscribe(
      (response) => {
        if (response.status === 'success') {
          this.isLoggingOut = false; // Reset loading state
          this.userInfo = null; // Clear local user info
  
          // Redirect to login page
          window.location.href = '/client';
        } else {
          this.isLoggingOut = false; // Reset loading state
          console.error('Failed to log out:', response.message);
        }
      },
      (error) => {
        this.isLoggingOut = false; // Reset loading state
        console.error('Error logging out:', error);
      }
    );
  }
  
  changePassword(): void {
    // Implement change password functionality here
    console.log('Change Password clicked');
  }
}
