import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientService } from '../../../services/client.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../shared/notification.service';

@Component({
  selector: 'app-request-dialog',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, CommonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './request-dialog.component.html',
  styleUrls: ['./request-dialog.component.css']
})
export class RequestDialogComponent implements OnInit {
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  divisions: any[] = [];
  offices: any[] = [];
  divisionsForSelectedOffice: any[] = [];

  selectedDivision: string = '';
  selectedOffice: string = '';    
  name: string = '';
  property_no: string = '';
  contact_no: string = '';
  dept_head: string = '';
  office_name: string = '';
  issue_request: string = '';

  constructor(public dialogRef: MatDialogRef<RequestDialogComponent>, private clientService: ClientService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    Promise.all([this.fetchDivisions(), this.fetchOffices()])
      .then(() => this.isLoading = false)
      .catch(() => this.isLoading = false);
  }

  fetchDivisions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientService.getDivisions().subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.divisions = response.data;
            resolve();
          } else {
            console.error('Failed to fetch divisions');
            reject();
          }
        },
        (error) => {
          console.error('Error fetching divisions', error);
          reject();
        }
      );
    });
  }

  fetchOffices(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientService.getOffices().subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.offices = response.data;
            resolve();
          } else {
            console.error('Failed to fetch offices');
            reject();
          }
        },
        (error) => {
          console.error('Error fetching offices', error);
          reject();
        }
      );
    });
  }


  submitRequest(): void {
    if (!this.selectedDivision) {
      this.notificationService.showNotification('Please select a division before submitting the request.', 'error');
      return;
    }
    
    this.isSubmitting = true;
    const requestData = {
      name: this.name,
      property_no: this.property_no,
      contact: this.contact_no,
      dept_head: this.dept_head,
      office_id: parseInt(this.office_name), 
      issue_request: this.issue_request,
      division_id: parseInt(this.selectedDivision)
    };
  
    this.clientService.submitRequest(requestData).subscribe(
      (response: any) => {
        this.isSubmitting = false;
        if (response.status === 'success') {
          this.notificationService.showNotification('Your request has been forwarded to your Immediate Supervisor/Head Office for approval.', 'success');
          this.dialogRef.close();
        } else {
          this.notificationService.showNotification('Failed to submit request, Please try again', 'error', + response.message);
        }
      },
      (error) => {
        this.isSubmitting = false;
        console.error('Error submitting request', error);
        this.notificationService.showNotification('An error has occurred while submitting the request.', 'error');
      }
    );
  }
  

  closeDialog(): void {
    this.dialogRef.close();
  }


}
