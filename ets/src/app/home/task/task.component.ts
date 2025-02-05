import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { NotificationService } from '../../shared/notification.service';
import { AuthService } from '../../services/auth.service';
import JsBarcode from 'jsbarcode';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})

export class TaskComponent implements OnInit {
  @ViewChild('signaturePad', { static: false }) signaturePad!: ElementRef<HTMLCanvasElement>;
  currentUser: any; // To store the logged-in user

  isSignaturePadVisible: boolean = false;
  signatureDataUrl: string | null = null;

  isLoading: boolean = true;
  isButtonLoading: boolean = false;
  isSaveButtonLoading: boolean = false;

  reports: any[] = [];
  errorMessage: string = '';
  isViewDialogOpen: boolean = false;
  isEditDialogOpen: boolean = false;
  isForReleaseDialogOpen: boolean = false;

  filteredReports: any[] = [];
  selectedStatus: string = 'Pending'; // Default status filter
  
  isConfirmationDialogOpen: boolean = false; // Tracks if the confirmation dialog is open
  currentDate: string = ''; // Stores the current date
  currentReport: any = null; // Stores the report being accepted  

  paginatedReports: any[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  intervals: { [key: number]: any } = {}; // Store intervals for each report
  startTime: { [key: number]: Date } = {}; // Store the start time for each report
  durations: { [key: number]: string } = {}; // Store duration string for each report

  selectedReport: any = {
    selectedServices: [],
    service_level_id: {}, // Store selected service levels
    service_quantity_id: {},
    action_taken: '',  
    remarks: '',       
    date_started: '', 
    datetime_accomplished: '',
    date_released: '', 
    released: null,  
  };

  // Service Types and their corresponding service levels
  serviceTypes = [
    { id: 1, service_type: 'Basic Troubleshooting', quantity: 0 },
    { id: 2, service_type: 'Installation of OS', quantity: 0 },
    { id: 3, service_type: 'Installation of Applications', quantity: 0 },
    { id: 4, service_type: 'Data Backup', quantity: 0, levels: ['LC', 'HC'] },
    { id: 5, service_type: 'Data Retrieval', quantity: 0, levels: ['LC', 'HC'] },
    { id: 6, service_type: 'Printer', quantity: 0, levels: ['Moderate', 'Complex'] },
    { id: 7, service_type: 'Hardware Repair', quantity: 0, levels: ['Simple', 'Moderate', 'Complex'] },
    { id: 8, service_type: 'Network Repair', quantity: 0, levels: ['Moderate', 'Complex'] },
    { id: 9, service_type: 'Network', quantity: 0, levels: ['Wired', 'Wireless', 'Cabling'] },
    { id: 10, service_type: 'Virus', quantity: 0, levels: ['Simple', 'Moderate'] },
    { id: 11, service_type: 'Inspection', quantity: 0, levels: ['Delivery', 'Disposal'] },
    { id: 12, service_type: 'Registration to Biometrics', quantity: 0 } // No service levels
  ];
  

  constructor(private taskService: TaskService, private notificationService: NotificationService,
     private authService: AuthService, private pdfService: PdfService) {}

  ngOnInit(): void {
    this.fetchReportsForCurrentUser();
    this.fetchUserName();
  }

  fetchUserName(): void {
    this.authService.getUserPerms().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.currentUser = response.data;  // Store user data
        } else {
          console.error('Failed to fetch user info:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching user info:', error);
      }
    );
  }

  fetchReportsForCurrentUser(): void {
    this.isLoading = true;
  
    forkJoin({
      reports: this.taskService.fetchReportsForCurrentUser(),
      offices: this.taskService.fetchAllOffices()
    }).subscribe(
      ({ reports, offices }) => {
        this.isLoading = false;
  
        if (reports.status === 'success' && offices.status === 'success') {
          const officeMap = new Map(
            offices.data.map((office: { office_id: number; office_name: string }) => [office.office_id, office.office_name])
          );
  
          this.reports = reports.data.map((report: any) => ({
            ...report,
            office_name: officeMap.get(report.office_id) || 'Unknown'
          }));
          this.applyDefaultFilter();
        } else {
          this.errorMessage = 'Failed to fetch data.';
        }
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred while fetching data.';
      }
    );
  }
  // used for displaying the no of units/quantity 
  getServiceName(serviceId: number): string {
    const service = this.serviceTypes.find(service => service.id === serviceId);
    return service ? service.service_type : 'Unknown Service';
  }

  // handle the checkbox change 
  onServiceChange(serviceId: number, event: any): void {
    if (event.target.checked) {
      this.selectedReport.selectedServices.push(serviceId);

    // Initialize service quantity if not already initialized
    if (!this.selectedReport.service_quantity_id[serviceId]) {
      this.selectedReport.service_quantity_id[serviceId] = 1; // Default quantity is 1
    }

    // Initialize service level if necessary
    if (!this.selectedReport.service_level_id[serviceId]) {
      this.selectedReport.service_level_id[serviceId] = ''; // Default level is empty or choose an appropriate default
    }
  } else {
    // Remove service and its quantity/level
    delete this.selectedReport.service_level_id[serviceId];
    delete this.selectedReport.service_quantity_id[serviceId];

    // Remove the service ID from selected services
    this.selectedReport.selectedServices = this.selectedReport.selectedServices.filter(
      (id: number) => id !== serviceId
    );
    }
  }
  
  openEditDialog(report: any): void {
    this.notificationService.showNotification('Time stopped', 'warning');
    // Stop the timer for the report being edited
    if (this.intervals[report.id]) {
      clearInterval(this.intervals[report.id]); // Clear the interval
      delete this.intervals[report.id]; // Remove the interval reference
    }

    this.selectedReport = { 
      ...report, 
      selectedServices: report.services ? JSON.parse(report.services) : [],
      service_level_id: report.service_level_id ? JSON.parse(report.service_level_id) : {},
      service_quantity_id: report.service_quantity_id ? JSON.parse(report.service_quantity_id) : {} // Ensure it's initialized
    };
    this.isEditDialogOpen = true;
  }
  
  openForReleaseDialog(report: any): void {
    this.selectedReport = { 
      ...report, 
      selectedServices: report.services ? JSON.parse(report.services) : [],
      service_level_id: report.service_level_id
        ? JSON.parse(report.service_level_id)
        : {},
    };
    this.isForReleaseDialogOpen = true;
  }

  formatDateTime(dateTime: string): string | null {
    if (!dateTime) return null;
    const date = new Date(dateTime);
    const offset = date.getTimezoneOffset(); // Get timezone offset in minutes
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  // submit accomplish form
  submitEditForm(): void {
    this.isButtonLoading = true;

    const updatedData = {
      ...this.selectedReport,
      datetime_accomplished: this.formatDateTime(this.selectedReport.datetime_accomplished),
      services: this.selectedReport.selectedServices,
      service_level_id: this.selectedReport.service_level_id,
      service_quantity_id: this.selectedReport.service_quantity_id, // Include service quantities
      request_status: 'For Release',
      task_duration: this.durations[this.selectedReport.id],  
    };
  
    this.taskService.updateReport(updatedData).subscribe(
      (response) => {
        this.isButtonLoading = false; 
        if (response.status === 'success') {
          this.fetchReportsForCurrentUser(); // Reload the data
          this.notificationService.showNotification('Job Request has been accomplished', 'success');
          this.closeEditDialog();
        } else {
          this.errorMessage = response.message || 'Failed to update the report.';
          this.notificationService.showNotification('Failed to update the request','error');
        }
      },
      (error) => {
        this.isButtonLoading = false;
        this.errorMessage = 'An error occurred while saving changes.';
        this.notificationService.showNotification('An error occured while saving changes', 'error');
      }
    );
    
  }

  submitForReleaseForm(): void {
    this.isButtonLoading = true;
    const releasedTo = this.selectedReport.released_to || this.selectedReport.name;
    const updatedData = {
      ...this.selectedReport,
      released: true,
      released_to: releasedTo,
      request_status: 'Released',
    };
  
    this.taskService.updateForReleaseForm(updatedData).subscribe(
      (response) => {
        this.isButtonLoading = false; 
        if (response.status === 'success') {
          this.fetchReportsForCurrentUser(); // Reload the data
          this.notificationService.showNotification('Job Request has been accomplished', 'success');
          this.closeEditDialog();
        } else {
          this.errorMessage = response.message || 'Failed to update the report.';
          this.notificationService.showNotification('Failed to update the request','error');
        }
      },
      (error) => {
        this.isButtonLoading = false;
        this.errorMessage = 'An error occurred while saving changes.';
        this.notificationService.showNotification('An error occured while saving changes', 'error');
      }
    );
  }  

  showSignaturePad(): void {
    this.isSignaturePadVisible = true;
  
    setTimeout(() => {
      const canvas = this.signaturePad.nativeElement;
      const context = canvas.getContext('2d');
      if (canvas && context) {
        canvas.width = 400; // Adjust as needed
        canvas.height = 200; // Adjust as needed
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.enableDrawing(canvas, context);
      }
    });
  }
  
  enableDrawing(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    let drawing = false;
  
    const startDrawing = (event: MouseEvent) => {
      drawing = true;
      context.beginPath();
      context.moveTo(event.offsetX, event.offsetY);
    };
  
    const draw = (event: MouseEvent) => {
      if (!drawing) return;
      context.lineTo(event.offsetX, event.offsetY);
      context.stroke();
    };
  
    const stopDrawing = () => (drawing = false);
  
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
  }
  
  clearSignature(): void {
    const canvas = this.signaturePad.nativeElement;
    const context = canvas.getContext('2d');
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  saveSignature(): void {
    this.isSaveButtonLoading = true;

    setTimeout(() => {
      this.isSaveButtonLoading = false;
      // Handle signature saving logic here
    }, 2000);  // Adjust the time as per your logic (e.g., 2 seconds)

    const canvas = this.signaturePad.nativeElement;
    this.signatureDataUrl = canvas.toDataURL('image/png'); // Get base64 image
  
    // Prepare data for saving
    const signatureData = {
      reportId: this.selectedReport.id, // Use appropriate identifier
      signature: this.signatureDataUrl,
    };
  
    // Save the signature
    this.taskService.saveSignature(signatureData).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.notificationService.showNotification('Signature has been Added!', 'success');
          console.log('Signature saved successfully.');
          this.isSignaturePadVisible = false; // Hide signature pad after saving
          this.selectedReport.signature = this.signatureDataUrl; // Update the report object
        } else {
          this.notificationService.showNotification('Failed to save signature:', 'error', + response.message);
          console.error('Failed to save signature:', response.message);
        }
      },
      (error) => {
        this.notificationService.showNotification('Oops, Looks like we ran into a problem.', 'error');
        console.error('An error occurred while saving the signature:', error);
      }
    );
  }

  closeOnOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('edit-dialog-overlay')) {
      this.closeEditDialog();
    }
  }

  closeEditDialog(): void {
  // Check if the signature pad was visible and clear it if not saved
  if (this.isSignaturePadVisible) {
    const canvas = this.signaturePad.nativeElement;
    const context = canvas.getContext('2d');
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear the signature
    }
  }

  this.isSignaturePadVisible = false; // Hide the signature pad 
  this.isEditDialogOpen = false;
  this.isForReleaseDialogOpen = false;
  }
  
  openViewDialog(report: any): void {
    this.selectedReport = { 
      ...report, 
      selectedServices: report.services ? JSON.parse(report.services) : [],
      service_level_id: report.service_level_id ? JSON.parse(report.service_level_id) : {}, 
      service_quantity_id: report.service_quantity_id ? JSON.parse(report.service_quantity_id) : {}, // Ensure this is parsed correctly
      signature: report.signature,
    };

    // Convert service IDs to readable service names
    this.selectedReport.selectedServiceNames = this.selectedReport.selectedServices.map((serviceId: number) => {
      const service = this.serviceTypes.find(s => s.id === serviceId);
      return service ? service.service_type : 'Unknown Service'; // Return service name or 'Unknown Service'
    });
  
    this.isViewDialogOpen = true;

    // Generate barcode based on the control_no
    setTimeout(() => {
      if (this.selectedReport.control_no) {
        JsBarcode("#barcode", this.selectedReport.control_no, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 50,
          displayValue: true
        });
      }
    });
  }

  closeViewDialog(event?: MouseEvent): void {
    this.isViewDialogOpen = false; // Close the dialog
  }  

  applyDefaultFilter(): void {
    this.filterReports(); // Apply filter on load
  }

  filterReports(): void {
    const query = this.searchQuery.toLowerCase();
    
    // Filter reports based on status and search query
    this.filteredReports = this.reports.filter((report) => {
      const matchesStatus = report.request_status === this.selectedStatus || !this.selectedStatus;
      const matchesSearch =
        !query ||
        report.control_no.toLowerCase().includes(query) ||
        report.name.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  
    // Update pagination
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredReports.length / this.itemsPerPage);
    this.changePage(1); // Reset to the first page
  }
  
  changePage(page: number): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedReports = this.filteredReports.slice(startIndex, endIndex);
  }

  acceptReport(report: any): void {
    this.openConfirmationDialog(report); // Open confirmation dialog 
  }  

  openConfirmationDialog(report: any): void {
    this.currentReport = report; // Store the selected report
    this.currentDate = new Date().toISOString().split('T')[0]; // Format current date as YYYY-MM-DD
    this.isConfirmationDialogOpen = true; // Open the dialog
  }
  
  closeConfirmationDialog(): void {
    this.isConfirmationDialogOpen = false; // Close the dialog
    this.currentReport = null; // Reset the current report
  }

  // Start timer for a specific report
  startTimer(reportId: number): void {
    const startTime = new Date(); // Get current time
    this.startTime[reportId] = startTime;

    // Update the interval object to track the time
    this.intervals[reportId] = setInterval(() => {
      const elapsedTime = new Date().getTime() - startTime.getTime(); // Time difference in milliseconds
      const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
      const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
      this.durations[reportId] = `${hours}:${minutes}:${seconds}`; // Format duration
    }, 1000); // Update every second
  }
  
  confirmAccept(): void {
    if (this.currentReport) {
      this.startTimer(this.currentReport.id);
      this.currentReport.date_started = this.currentDate; // Set the current date to the report
      this.acceptReport(this.currentReport); // Call acceptReport logic
    }
    this.closeConfirmationDialog(); // Close the dialog
    this.notificationService.showNotification('Request has been accepted, time started', 'success');
  }

  generatePdf() {
    console.log('Selected Report Data:', this.selectedReport); // Log the data to ensure it's populated
    this.pdfService.generatePdf(this.selectedReport, this.currentUser).subscribe({
      next: (pdfBlob: Blob) => {
        // Create a URL for the Blob
        const fileURL = URL.createObjectURL(pdfBlob);
        
        // Open a new tab with the PDF content
        const newTab = window.open(fileURL, '_blank');
        
        // Create a download link in the new tab
        if (newTab) {
          const downloadLink = newTab.document.createElement('a');
          downloadLink.href = fileURL;
          downloadLink.download = 'report.pdf'; // Name the file
          downloadLink.textContent = 'Click here to download the PDF';
          
          // Append the download link to the new tab's document body
          newTab.document.body.appendChild(downloadLink);
        }
      },
      error: (err) => {
        console.error('Error generating PDF:', err);
      }
    });
  }
  
  
  
  
  
}




