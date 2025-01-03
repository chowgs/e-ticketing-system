import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../shared/notification.service';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css'
})
export class MonitorComponent implements OnInit {
  reports: any[] = [];
  personnelNames: any[] = []; // Store personnel names
  isLoading: boolean = true; // Initialize loading flag

  constructor(private authService: AuthService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Fetch the accepted reports when the component initializes
    this.fetchAcceptedReports();
    this.loadPersonnelNames();

  }

  fetchAcceptedReports(): void {
    this.isLoading = true; // Show spinner
      this.authService.fetchAcceptedReports().subscribe(
          (response: any) => {
              if (response.status === 'success') {
                  this.reports = response.data.map((report: any) => ({
                      ...report,
                      selectedPersonnelId: report.personnel_id || null // Initialize dropdown selection
                  }));
              } else {
                  console.error('Error fetching reports:', response.message);
              }
              this.isLoading = false; // Hide spinner
          },
          (error) => {
              console.error('Error fetching reports:', error);
              this.isLoading = false; // Hide spinner
          }
      );
  }


  loadPersonnelNames(): void {
    this.authService.getPersonnelByDivision().subscribe(
      (response) => {
        if (response.status === 'success') {
          this.personnelNames = response.data || [];
        } else {
          console.log(response.message || 'Failed to fetch personnel names.');
        }
      },
      (error) => {
        console.error('Error fetching personnel names:', error);
      }
    );
  }

//   assignPersonnel(report: any): void {
//     if (!report.selectedPersonnelId) {
//         alert("Please select a personnel to assign.");
//         return;
//     }

//     console.log("Control No:", report.control_no); // Log the control_no value
//     console.log("Selected Personnel ID:", report.selectedPersonnelId); // Log the selected personnel_id value

//     this.authService.assignPersonnelToReport(report.control_no, report.selectedPersonnelId).subscribe(
//         (response) => {
//             if (response.status === 'success') {
//                 alert("Personnel assigned successfully!");
//                 report.personnel_id = report.selectedPersonnelId;  // Update displayed personnel_id
//             } else {
//                 alert("Failed to assign personnel.");
//             }
//         },
//         (error) => {
//             console.error("Error assigning personnel:", error);
//         }
//     );
// }
assignPersonnel(report: any): void {
  if (!report.selectedPersonnelId) {
    this.notificationService.showNotification('Please select a personnel', 'warning');
    return;
  }

  // Set assigning state for the specific report
  report.isAssigning = true;

  this.authService.assignPersonnelToReport(report.control_no, report.selectedPersonnelId).subscribe(
    (response) => {
      if (response.status === 'success') {
        this.notificationService.showNotification('Personnel has been assigned', 'success');
        report.personnel_id = report.selectedPersonnelId; // Update displayed personnel_id
        this.refreshPage(); // Trigger a page refresh with loading animation
      } else {
        this.notificationService.showNotification('Failed to assign personnel', 'error');
      }
      report.isAssigning = false; // Reset assigning state
    },
    (error) => {
      console.error("Error assigning personnel:", error);
      this.notificationService.showNotification('An error has occured while trying to assign personnel', 'error');
      report.isAssigning = false; // Reset assigning state
    }
  );
}

refreshPage(): void {
  this.isLoading = true; // Show global loading animation
  setTimeout(() => {
    location.reload(); // Reload the page after a short delay
  }, 1000); // Optional delay for smoother UX
}

}



  // serviceReports: any[] = [];

  // constructor(private authService: AuthService) {}

  // ngOnInit(): void {
  //   this.loadServiceReports();
  //   this.loadPersonnelNames();
  // }

  // loadServiceReports(): void {
  //   this.authService.getReportsByDivision().subscribe(
  //     (response) => {
  //       if (response.status === 'success') {
  //         this.serviceReports = response.data;
  //       } else {
  //         console.log(response.message);
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching service reports:', error);
  //     }
  //   );
  // }