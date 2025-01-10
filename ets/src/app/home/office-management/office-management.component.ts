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
  isLoadingUpdate: boolean = false; // Loading state for updating an office

  isModalOpen = false;
  isEditModalOpen = false; // For edit modal
  selectedOffice: any = null; // Store the office being edited

  currentPage: number = 1; // Track the current page
  rowsPerPage: number = 8; // Maximum rows per page

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

  // Function to open the modal
  openModal() {
    this.isModalOpen = true;
  }

  // Function to close the modal
  closeModal() {
    this.isModalOpen = false;
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

  openEditModal(office: any) {
    this.selectedOffice = { ...office }; // Create a copy to edit
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.selectedOffice = null;
    this.isEditModalOpen = false;
  }

  updateOffice(): void {
    if (this.selectedOffice && this.selectedOffice.office_name.trim()) {
      this.selectedOffice.office_name = this.selectedOffice.office_name.toUpperCase();
      this.isLoadingUpdate = true;

      this.authService.updateOffice(this.selectedOffice).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.notificationService.showNotification(
              'Office updated successfully!',
              'success'
            );
            this.fetchOffices(); // Refresh the list
            this.closeEditModal();
          } else {
            this.notificationService.showNotification(
              `Failed to update office: ${response.message}`,
              'error'
            );
          }
        },
        (error) => {
          console.error('Error updating office:', error);
          this.notificationService.showNotification(
            'An error occurred while updating office',
            'error'
          );
        },
        () => {
          this.isLoadingUpdate = false;
        }
      );
    } else {
      this.notificationService.showNotification(
        'Please enter a valid office name',
        'error'
      );
    }
  }

  // Method to handle pagination
  getPaginatedOffices(): any[] {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    return this.offices.slice(startIndex, startIndex + this.rowsPerPage);
  }

  changePage(direction: string): void {
    if (direction === 'next' && (this.currentPage * this.rowsPerPage) < this.offices.length) {
      this.currentPage++;
    } else if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    }
  }

}
