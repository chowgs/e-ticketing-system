import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [],
  template: `
    <div class="confirmation-dialog-container">
      <h4>Confirm Approval</h4>
      <p>Do you want to approve this request?</p>
      <p class="current-datetime">Current Date and Time: {{ currentDateTime }}</p>
      <div class="d-flex justify-content-center mt-4">
        <button class="btn btn-secondary me-2" (click)="onCancel()">Cancel</button>
        <button class="btn btn-success" (click)="onConfirm()">Approve</button>
      </div>
    </div>
  `,
  styles: [
    `.confirmation-dialog-container {
      padding: 20px;      
    }
    h4 {
      margin-bottom: 15px;
    }
    .mt-4 {
     margin-top: 1rem;
    }
    .me-2 {
     margin-right: 0.5rem;
    }
    .current-datetime {
      margin-top: 10px;
      font-size: 0.9em;
      color: gray;
    }
    `,
  ],
  styleUrls: ['./confirmation-dialog.component.css'],
})
export class ConfirmationDialogComponent implements OnDestroy {
  currentDateTime: string = ''; // Holds the current date and time as a string
  private intervalId: any; // Stores the interval ID for cleanup

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {
    this.updateDateTime(); // Set the initial date and time
    this.intervalId = setInterval(() => this.updateDateTime(), 1000); // Update every second
  }

  // Updates the currentDateTime property with the current date and time
  updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = now.toLocaleString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Clear the interval when the component is destroyed
    }
  }
}
