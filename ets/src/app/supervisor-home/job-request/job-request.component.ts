import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SupervisorService } from '../../services/supervisor.service';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../shared/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-request',
  templateUrl: './job-request.component.html',
  styleUrls: ['./job-request.component.css'],
  imports: [CommonModule, MatTableModule, MatPaginatorModule, FormsModule],
  standalone: true,
})
export class JobRequestComponent implements OnInit {
  jobRequests: any[] = [];
  filteredJobRequests: any[] = []; // Only requests with approval_status !== '1'

  isLoading: boolean = true;
  loadingRequests: { [key: number]: boolean } = {}; // Track loading state per request

  paginatedJobRequests: any[] = [];
  currentPage: number = 0;
  pageSize: number = 5;

  searchFilters = { name: '' };
  sortOption = 'date_of_request';
  sortOrder = 'ASC';

  constructor(
    private supervisorService: SupervisorService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.fetchJobRequests();
  }

  applyFilters(): void {
    this.filteredJobRequests = this.jobRequests.filter((request) => {
      const matchesName = this.searchFilters.name
        ? request.name.toLowerCase().includes(this.searchFilters.name.toLowerCase())
        : true;
      return matchesName;
    });
    this.updatePaginatedRequests();
  }
  
  applySorting(): void {
    this.filteredJobRequests.sort((a, b) => {
      const fieldA = a[this.sortOption]?.toString().toLowerCase() || '';
      const fieldB = b[this.sortOption]?.toString().toLowerCase() || '';
      return this.sortOrder === 'ASC'
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    });
    this.updatePaginatedRequests();
  }
  
  fetchJobRequests(): void {
    const params = {
      filters: this.searchFilters,
      sort: this.sortOption,
      order: this.sortOrder,
    };
  
    this.supervisorService.getJobRequests().subscribe(
      (response) => {
        if (response.status === 'success') {
          this.jobRequests = response.data;
          this.applyFilters(); // Apply search filters
          this.applySorting(); // Apply sorting
          this.filteredJobRequests = this.jobRequests.filter(
            (request) => request.approval_status !== '1'
          );
          this.updatePaginatedRequests();
          this.isLoading = false;
        } else {
          console.error('Failed to fetch job requests');
          this.isLoading = false;
        }
      },
      (error) => {
        console.error('API error: ', error);
        this.isLoading = false;
      }
    );
  }

  updatePaginatedRequests(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedJobRequests = this.filteredJobRequests.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedRequests();
  }

  openConfirmationDialog(request: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.updateApprovalStatus(request.id);
      }
    });
  }

  updateApprovalStatus(requestId: number): void {
    this.loadingRequests[requestId] = true; // Set loading state for the request
    this.supervisorService.updateApprovalStatus(requestId).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.notificationService.showNotification('Client request approved!', 'success');
          this.fetchJobRequests(); // Refresh the list after updating
        } else {
          this.notificationService.showNotification(response.message, 'error');
          console.error('Failed to approve the request.');
        }
        this.loadingRequests[requestId] = false; // Clear loading state
      },
      (error) => {
        this.notificationService.showNotification('An error occurred. Please try again later.', 'error');
        console.error('API error: ', error);
        this.loadingRequests[requestId] = false; // Clear loading state
      }
    );
  }
}