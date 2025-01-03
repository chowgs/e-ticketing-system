import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule} from '@angular/common';
import { NotificationService } from '../../shared/notification.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, FormsModule],
  styleUrls: ['./user-management.component.css']
})  
export class UserManagementComponent implements OnInit {

  myAccountForm!: FormGroup;
  addUserForm!: FormGroup;
  addPersonnelForm!: FormGroup;
  divisions: any[] = [];
  offices: any[] = [];
  selectedPermissions: number[] = [];
  users: any[] = []; // Store fetched users
  currentPage: number = 1; // Track the current page
  rowsPerPage: number = 5; // Maximum rows per page

  isLoadingFetch: boolean = false;
  isRegistering: boolean = false;
  isAddingPersonnel: boolean = false;


  constructor(private fb: FormBuilder, private authService: AuthService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Initialize forms with FormBuilder
    this.myAccountForm = this.fb.group({
      idNumber: [{ value: '', disabled: true }], // Display only
      name: [''], 
      designation: [''],
      division: [''],
      office: [''],
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    this.addUserForm = this.fb.group({
      id_number: ['', Validators.required],
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      designation: ['', Validators.required],
      division: ['', Validators.required],
      office: ['', Validators.required],
    });

   this.addPersonnelForm = this.fb.group({
     personnel_id: ['', Validators.required], 
     personnel_name: ['', Validators.required],
     division: ['', Validators.required],
  });

    // Fetch current user info
    this.loadUserInfo();
    this.loadDivisions();
    this.loadOffices();
    this.loadUsers();
  }

  loadUserInfo(): void {
    this.authService.getUserInfo().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.isLoadingFetch = false;
          const userData = response.data;
          this.myAccountForm.patchValue({
            idNumber: userData.id_number,
            name: userData.name,
            designation: userData.designation,
            office: userData.office_name,
            division: userData.division_name
          });
        } else {
          this.isLoadingFetch = false;
          this.notificationService.showNotification('Failed to retrieve user info.', 'error');
          console.error('Failed to retrieve user info');
        }
      },
      (error) => {
        this.isLoadingFetch = false;
        this.notificationService.showNotification('Error fetching user info ' ,'error', + error);
        console.error('Error fetching user info', error);
      }
    );
  }

  loadDivisions(): void {
    this.authService.getDivisions().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.isLoadingFetch = false;
          this.divisions = response.data; // Populate divisions array
        } else {
          this.isLoadingFetch = false;
          this.notificationService.showNotification('Failed to fetch divisions.', 'error');
          console.error('Failed to fetch divisions');
        }
      },
      (error) => console.error('Error fetching divisions', error)
    );
  }

  loadOffices(): void {
    this.authService.getOffices().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.isLoadingFetch = false;
          this.offices = response.data; // Populate offices array
        } else {
          this.isLoadingFetch = false;
          this.notificationService.showNotification('Failed to fetch offices', 'error');
          console.error('Failed to fetch offices');
        }
      },
      (error) => console.error('Error fetching offices', error)
    );
  }

  loadUsers(): void {
    this.isLoadingFetch = true;
    this.authService.getUsers().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.isLoadingFetch = false;
          this.users = response.data;
        } else {
          this.isLoadingFetch = false;
          this.notificationService.showNotification('Failed to fetch users', 'error');
          console.error('Failed to fetch users');
        }
      },
      (error) => console.error('Error fetching users', error),
      () => {
        this.isLoadingFetch = false; // Stop loading
      }
    );
  }
  
  // Method to handle pagination
  getPaginatedUsers(): any[] {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    return this.users.slice(startIndex, startIndex + this.rowsPerPage);
  }

  changePage(direction: string): void {
    if (direction === 'next' && (this.currentPage * this.rowsPerPage) < this.users.length) {
      this.currentPage++;
    } else if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // changePassword(): void {
  //   if (this.myAccountForm.valid) {
  //     const currentPassword = this.myAccountForm.value.currentPassword;
  //     const newPassword = this.myAccountForm.value.newPassword;
  //     const confirmPassword = this.myAccountForm.value.confirmPassword;

  //     if (newPassword !== confirmPassword) {
  //       console.error("New password and confirm password do not match.");
  //       return;
  //     }
      
  //     const passwordData = {
  //       id_number: this.myAccountForm.value.idNumber,
  //       current_password: currentPassword,
  //       new_password: newPassword
  //     };

  //     this.authService.changePassword(passwordData).subscribe(
  //       (response: any) => {
  //         if (response.status === 'success') {
  //           console.log('Password changed successfully.');
  //         } else {
  //           console.error('Failed to change password:', response.message);
  //         }
  //       },
  //       (error) => {
  //         console.error('Error changing password', error);
  //       }
  //     );
  //   }
  // }

  togglePermission(permission: number): void {
    const index = this.selectedPermissions.indexOf(permission);
    if (index > -1) {
      this.selectedPermissions.splice(index, 1);
    } else {
      this.selectedPermissions.push(permission);
    }
  }

  registerUser(): void {
    if (this.addUserForm.valid) {
      const userData = {
        ...this.addUserForm.value,
        permissions: JSON.stringify(this.selectedPermissions),
      };

      this.isRegistering = true;
      this.authService.register(userData).subscribe((response: any) => {
        if (response.status === 'success') {
          this.isRegistering = false;
          this.notificationService.showNotification('User registered successfully.', 'success');
          // alert('User registered successfully.');
          this.selectedPermissions = [];
        } else {
          this.isRegistering = false;
          this.notificationService.showNotification('User registration failed. ' ,'error', + response.message);
          // alert(response.message || 'User registration failed.');
        }
      });
    } else {
      this.isRegistering = false; 
      this.notificationService.showNotification('Please fill out all required fields.', 'error');
      // alert('Please fill out all required fields.');
    }
  }

  saveAsPersonnel(): void {
    if (this.addPersonnelForm.valid) {
      const formData = this.addPersonnelForm.value;
      const selectedDivision = this.divisions.find(
        (division) => division.division_id === formData.division
      );
  
      if (!selectedDivision) {
        this.notificationService.showNotification('Invalid division selected.', 'error');
        // alert('Invalid division selected.');
        return;
      }
      
      this.isAddingPersonnel = true;
      const personnelData = {
        personnel_id: formData.personnel_id, // Corrected to match formControlName
        personnel_name: formData.personnel_name, // Corrected to match formControlName
        division_id: formData.division,  // Save selected Division ID
        division_name: selectedDivision.division_name, // Save Division Name
      };
  
      // Call service to save data to the database
      this.authService.savePersonnel(personnelData).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.isAddingPersonnel = false;
            this.notificationService.showNotification('Personnel has been added!', 'success');
            // alert('Personnel saved successfully.');
            this.addPersonnelForm.reset();
          } else {
            this.isAddingPersonnel = false;
            this.notificationService.showNotification('Failed to save personnel.', 'error');
            // alert(response.message || 'Failed to save personnel.');
          }
        },
        (error) => {
          this.isAddingPersonnel = false;
          console.error('Error saving personnel:', error);
          this.notificationService.showNotification('An error occured while saving personnel ' ,'error');
          // alert('An error occurred while saving personnel.');
        }
      );
    } else {
      this.isAddingPersonnel = false;
      this.notificationService.showNotification('Please fill out all required fields.', 'error');
      // alert('Please fill out all required fields.');
    }
  }
  
  

  
}
