import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../shared/notification.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css'
})
export class UserSettingsComponent implements OnInit{
  myAccountForm: FormGroup;
  passwordForm: FormGroup;
  selectedPermissions: number[] = [];
  // allPermissions: { id: number; label: string }[] = [
  //   { id: 0, label: 'Technical Support' }, //dashboard, task maintenance log, change password
  //   { id: 1.1, label: 'Edit User' },
  //   { id: 1.2, label: 'Change User Password' },
  //   { id: 1.3, label: 'Add User' },
  //   { id: 1.4, label: 'Office Management' }, 
  //   { id: 1.5, label: 'Add/Edit Permissions' },
  //   { id: 1.6, label: 'Administrator' },
  //   { id: 1.7, label: 'User Management' },
  //   { id: 2.1, label: 'Monitoring' },
  //   { id: 3.1, label: 'IT Supervisor' },
  //   { id: 4.1, label: 'Office Supervisor' },
  // ];
  allPermissions: { id: number; label: string; children?: { id: number; label: string }[] }[] = [
    { id: 0, label: 'Technical Support' },
    { id: 1.6, label: 'Administrator', children: [
      { id: 1.1, label: 'Edit User' },
      { id: 1.2, label: 'Change User Password' },
      { id: 1.3, label: 'Add User' },
      { id: 1.4, label: 'Office Management' },
      { id: 1.5, label: 'Add/Edit Permissions' },
      { id: 1.7, label: 'User Management' },
    ]},
    { id: 2.1, label: 'Monitoring' },
    { id: 3.1, label: 'IT Supervisor' },
    { id: 4.1, label: 'Office Supervisor' },
  ];
  

  showPermissionsSection: boolean = false;  
  showAccountSettingsSection: boolean = true;
  showChangePasswordSection: boolean = true;

  isLoading: boolean = false;
  isSaving: boolean = false;
  isChangingPassword: boolean = false;
  isAddingPerms: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private notificationService: NotificationService) {
    this.myAccountForm = this.fb.group({
      idNumber: [{ value: '', disabled: true }],
      name: ['', [Validators.required]],
      designation: ['', Validators.required],
      office: ['', Validators.required],
      division: ['', Validators.required],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
      this.isLoading = true;
      // Get current user details from the backend and populate the form
      this.fetchPermissions();
      this.authService.getUserInfo().subscribe((response: any) => {
        if (response.status === 'success') {
          this.isLoading = false;
          this.myAccountForm.patchValue({
            idNumber: response.data.id_number, 
            name: response.data.name,
            designation: response.data.designation,
            office: response.data.office_name,  
            division: response.data.division_name,  
          });
          
          // Disable the idNumber control after setting the value
          this.myAccountForm.get('idNumber')?.disable();
        } else {
          alert('Failed to fetch user details');
        }
      });
  }

  saveChanges(): void {
    if (this.myAccountForm.invalid) {
      this.notificationService.showNotification('Please fill out all required fields.', 'error');
      return;
    }

    this.isSaving = true;
    const updatedData = this.myAccountForm.getRawValue(); 
    this.authService.updateUserInfo(updatedData).subscribe(
      (response: any) => {
        this.isSaving = false;
        if (response.status === 'success') {
          this.notificationService.showNotification('User information updated successfully.', 'success');
        } else {
          this.notificationService.showNotification('Failed to update user information: ' ,'error', + response.message);
        }
      },
      (error) => {
        this.isSaving = false;
        console.error('Error updating user information', error);
        this.notificationService.showNotification('An error occurred while updating your information.', 'error');
      }
    );
  }

  changePassword(): void {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.notificationService.showNotification('Password do not match.', 'error');
      return;
    }

    this.isChangingPassword = true;
    this.authService.changePassword({ current_password: currentPassword, new_password: newPassword }).subscribe(
      (response: any) => {
        this.isChangingPassword = false;
        if (response.status === 'success') {
          this.notificationService.showNotification('Password updated successfully.', 'success');
          this.passwordForm.reset();
        } else {
          this.notificationService.showNotification('Failed to update user password: ', 'error', + response.message);
        }
      },
      (error) => {
        this.isChangingPassword = false;
        console.error('Error changing password', error);
        this.notificationService.showNotification('An error occurred while updating your password.', 'error');
      }
    );
  }

  fetchPermissions(): void {
    this.authService.getUserPermissions().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.selectedPermissions = response.permissions || [];

          // Check if any of the required permissions are present
          this.showAccountSettingsSection = this.selectedPermissions.includes(1.1);
          this.showChangePasswordSection =  this.selectedPermissions.includes(1.2); 
          this.showPermissionsSection = this.selectedPermissions.includes(1.5);
        } else {
          alert('Failed to fetch permissions.');
        }
      },
      (error) => {
        console.error('Error fetching permissions', error);
      }
    );
  }

  // togglePermission(permission: number): void {
  //   const index = this.selectedPermissions.indexOf(permission);
  //   if (index > -1) {
  //     this.selectedPermissions.splice(index, 1);
  //   } else {
  //     this.selectedPermissions.push(permission);
  //   }
  // }

  togglePermission(permission: number, children?: { id: number }[]): void {
    const index = this.selectedPermissions.indexOf(permission);
  
    if (index > -1) {
      // If permission is already selected, remove it
      this.selectedPermissions.splice(index, 1);
  
      // If it has children, remove them as well
      if (children) {
        children.forEach(child => {
          const childIndex = this.selectedPermissions.indexOf(child.id);
          if (childIndex > -1) {
            this.selectedPermissions.splice(childIndex, 1);
          }
        });
      }
    } else {
      // Add the selected permission
      this.selectedPermissions.push(permission);
  
      // If it has children, add them as well
      if (children) {
        children.forEach(child => {
          if (!this.selectedPermissions.includes(child.id)) {
            this.selectedPermissions.push(child.id);
          }
        });
      }
  
      // If a child is selected, ensure the parent (Administrator) is also selected
      const parent = this.allPermissions.find(p => p.children?.some(child => child.id === permission));
      if (parent && !this.selectedPermissions.includes(parent.id)) {
        this.selectedPermissions.push(parent.id);
      }
    }
  }
  

  savePermissions(): void {
    this.isAddingPerms = true;
    this.authService.updateUserPermissions(this.selectedPermissions).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.isAddingPerms = false;
          this.notificationService.showNotification('Permissions updated successfully.', 'success');
        } else {
          this.isAddingPerms = false;
          this.notificationService.showNotification('Failed to permissions update successfully.', 'error');
        }
      },
      (error) => {
        this.isAddingPerms = false;
        this.notificationService.showNotification('Error updating permissions.', 'error');
      }
    );
  }
}
