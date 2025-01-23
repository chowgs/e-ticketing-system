import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';  
import { NotificationService } from '../../shared/notification.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.css'
})
export class ChangePasswordDialogComponent {
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string | null = null;
  isChangingPassword: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,  
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {}

  // Form submission method
  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New passwords do not match.';
      this.notificationService.showNotification('Password do not match.', 'error');
      return;
    }

    // Call the changePassword method
    this.isChangingPassword = true;
    this.errorMessage = null;

    this.authService.changeUserPassword(this.currentPassword, this.newPassword)
      .subscribe(
        response => {
          if (response.status === 'success') {
            this.notificationService.showNotification('Password changed successfully', 'success');
            this.dialogRef.close(true); // Notify parent component on success
          } else if (response.status === 'fail' && response.message === 'Current password is incorrect.') {
            this.errorMessage = 'Invalid current password.';
            this.notificationService.showNotification('Invalid current password.', 'error');
          } else {
            this.errorMessage = response.message;
          }
        },
        error => {
          this.notificationService.showNotification('Error changing password. Please try again later', 'error');
          this.errorMessage = 'Error changing password. Please try again later.';
        }
      )
      .add(() => {
        this.isChangingPassword = false;
      });
  }

  closeDialog() {
    this.dialogRef.close(); // Close dialog without any action
  }
}
