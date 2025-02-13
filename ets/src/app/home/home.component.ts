import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../shared/notification/notification.component';
import { MatBadgeModule } from '@angular/material/badge';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  isDropdownActive: boolean = false;
  isSidebarVisible = false;
  // Permission flags
  showItPersonnelSection: boolean = false;
  showDashboardSection: boolean = false;
  showPMSLogSection: boolean = false;
  showAdminSection: boolean = false;
  showMonitoringSection: boolean = false;
  showSupervisorSection: boolean = false;
  showItSupervisorSection: boolean = false;
  showChangePasswordSection: boolean = true;
  // showOfficeManagement: boolean = false;
  // showUserManagement: boolean = false;

  isLoggingOut: boolean = false; // Loading state for logout  

  constructor(private authService: AuthService, private dialog: MatDialog, private router: Router) {}

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
          this.showChangePasswordSection = this.hasPermission(1.2);
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

  hasChangePasswordPermission(): boolean {
    // Check for permissions 1.9, 3.1, or 4.1
    return this.userInfo.permissions.includes(1.9) || this.userInfo.permissions.includes(3.1) || this.userInfo.permissions.includes(4.1);
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
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle any post-dialog actions (e.g., notify user of success)
        console.log('Password changed successfully');
      }
    });
  }

  toggleDropdown() {
    this.isDropdownActive = !this.isDropdownActive;
  }
  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}
