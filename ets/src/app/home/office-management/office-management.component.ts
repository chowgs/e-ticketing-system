import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../shared/notification.service';

@Component({
  selector: 'app-office-management',
  standalone: true,
  templateUrl: './office-management.component.html',
  styleUrls: ['./office-management.component.css'],
  imports: [FormsModule, CommonModule]
})
export class OfficeManagementComponent implements OnInit {
  officeName: string = '';
  offices: any[] = []; // To store the list of offices
  isLoadingFetch: boolean = false; // Loading state for fetching offices
  isLoadingAdd: boolean = false; // Loading state for adding an office

  constructor(private authService: AuthService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.fetchOffices(); // Fetch offices on component initialization
  }

  fetchOffices(): void {
    this.isLoadingFetch = true; // Start loading
    this.authService.getAllOffices().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.offices = response.data;
        } else {
          console.error('Failed to fetch office');
        }
      },
      (error) => {
        console.error('Error fetching offices:', error);
      },
      () => {
        this.isLoadingFetch = false; // Stop loading
      }
    );
  }

  addOffice(): void {
    if (this.officeName.trim()) {
      this.isLoadingAdd = true; // Start loading
      const officeData = {
        office_name: this.officeName.toUpperCase()
      };

      this.authService.addOffice(officeData).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.notificationService.showNotification('Office has been added!','success');
            // alert('Office added successfully.');
            this.officeName = ''; // Reset the input field
            this.fetchOffices(); // Refresh the list of offices
          } else if (response.message === 'Office already exists.') {
            this.notificationService.showNotification('Office already exists.', 'error');
          } else {
            this.notificationService.showNotification(`Failed to add office: ${response.message}`, 'error');
            // alert('Failed to add office: ' + response.message);
          }
        },
        (error) => {
          console.error('Error adding office:', error);
          this.notificationService.showNotification('An error occurred while adding office','error');
          // alert('An error occurred while adding the office.');
        },
        () => {
          this.isLoadingAdd = false; // Stop loading
        }
      );
    } else {
      this.notificationService.showNotification('Please enter the office name','error');
      // alert('Please enter an office name.');
    }
  }
}
