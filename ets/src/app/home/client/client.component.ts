import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RequestDialogComponent } from './request-dialog/request-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../shared/notification.service';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [FormsModule, RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent {
  isMenuOpen = false;
  isLoginVisible = false; // Controls visibility of the login form

  loginForm: FormGroup;
  errorMessage: string = '';

  search_box!: string
  searchResults: any[] = []; // Store fetched data

  isViewDialogOpen: boolean = false;
  selectedReport: any = null;

  isLoginLoading: boolean = false; // loading state for login
  isSearchLoading: boolean = false; // loading state for search
  error: string = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
    private clientService: ClientService,
    private notificationService: NotificationService,

  ) {
    this.loginForm = this.fb.group({
      id_number: ['', Validators.required],
      password: ['', Validators.required],
    });
    
  }

  showLogin(): void {
    this.isMenuOpen = false; // Close the menu after clicking Login
    this.isLoginVisible = true; // Show the login form when Login is clicked
    this.loginForm.reset();  // Optionally reset the form if required
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.notificationService.showNotification('Please fill out all required fields.', 'error');
      return;
    }
  
    this.isLoginLoading = true;
  
    this.authService.login(this.loginForm.value).subscribe(
      (response: any) => {
        this.isLoginLoading = false;
        if (response.status === 'success') {
          this.notificationService.showNotification('Login Successful!', 'success');
          
          // After login, check permissions and redirect
          this.authService.getPermissionsAndRedirect().subscribe(() => {
          });
  
        } else {
          this.notificationService.showNotification(response.message, 'error');
        }
      },
      (error) => {
        this.isLoginLoading = false;
        this.notificationService.showNotification('An error occurred. Please try again later.', 'error');
      }
    );
  }
 
  // Function to open the make new request dialog
  openRequestDialog(): void {
    this.dialog.open(RequestDialogComponent, {
      width: '800px',
      height: '600px' 
    });
  }

  onSearch(): void {
    this.isSearchLoading = true;
    this.error = '';
  
    this.clientService.getServiceReport(this.search_box).subscribe(
      (response: any) => {
        this.isSearchLoading = false;
        if (response.status === 'success') {
          this.searchResults = response.data;
        } else {
          this.searchResults = [];
          this.error = response.message;
        }
      },
      (err) => {
        this.isSearchLoading = false;
        this.error = 'An error occurred while fetching data.';
      }
    );
  }

  openViewDialog(report: any): void {
    this.selectedReport = report;
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

  closeViewDialog(): void {
    this.isViewDialogOpen = false;
    this.selectedReport = null;
  }

  toggleMenu(){
    this.isMenuOpen = !this.isMenuOpen;
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
      menuToggle.classList.toggle('open', this.isMenuOpen);
    }
  }

  // Close the login form
  closeLoginForm(): void {
    this.isLoginVisible = false; // Close the login form
  }

  
}
