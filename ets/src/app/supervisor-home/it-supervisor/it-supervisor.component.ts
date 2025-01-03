import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { SupervisorService } from '../../services/supervisor.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-it-supervisor',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule, FormsModule],
  templateUrl: './it-supervisor.component.html',
  styleUrls: ['./it-supervisor.component.css']
})
export class ItSupervisorComponent implements OnInit {
  isLoading: boolean = false;  // Loading state flag

  approvedReports: any[] = [];
  selectedReport: any = null;
  filteredReports: any[] = [];

  searchTerm: string = '';

  @ViewChild('reviewDialog', { static: false }) reviewDialog!: TemplateRef<any>;
  @ViewChild('confirmDialog', { static: false }) confirmDialog!: TemplateRef<any>;

  constructor(private supervisorService: SupervisorService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchApprovedReports();
  }

  fetchApprovedReports(): void {
    this.isLoading = true;
    this.supervisorService.getApprovedReports().subscribe(
      (response) => {
        if (response.status === 'success') {
          this.isLoading = false;
          console.log('Approved Reports:', response.data);
          this.approvedReports = response.data;
          this.filteredReports = this.approvedReports; // Initialize filtered reports
        } else {
          console.error('Failed to fetch approved reports');
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('API error: ', error);
        this.isLoading = false;
      }
    );
  }

  openReviewDialog(report: any): void {
    this.selectedReport = report; // Set the selected report for the dialog
    this.dialog.open(this.reviewDialog); // Open the dialog with the ng-template
  }
  
  openConfirmDialog(report: any): void {
    this.selectedReport = report; // Set the selected report for the confirmation
    this.dialog.open(this.confirmDialog); // Open the confirmation dialog
  }

  acceptJobRequest(): void {
    this.isLoading = true; // Set loading to true when request starts
    if (this.selectedReport) {
      this.supervisorService.acceptJobRequest(this.selectedReport).subscribe(
        (response) => {
          if (response.status === 'success') {
            console.log('Job request accepted:', response.data);
            // Re-fetch or update reports to reflect changes
            this.fetchApprovedReports();
          } else {
            console.error('Failed to accept job request:', response.message);
          }
          this.isLoading = false; // Reset loading after response
          this.dialog.closeAll(); // Close the dialog
        },
        (error) => {
          console.error('API error:', error);
          this.isLoading = false; // Reset loading after error
        }
      );
    }
  }
  

  closeDialog(): void {
    this.dialog.closeAll(); // Close the dialog
  }

  filterReports(): void {
    this.filteredReports = this.approvedReports.filter((report) => {
      const matchesSearch =
        this.searchTerm.trim() === '' ||
        report.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        report.issue_request.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesSearch;
    });
  }  
}
