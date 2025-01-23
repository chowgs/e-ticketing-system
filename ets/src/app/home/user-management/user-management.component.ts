// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { AuthService } from '../../services/auth.service';
// import { CommonModule} from '@angular/common';
// import { NotificationService } from '../../shared/notification.service';
// // import { MatDialog } from '@angular/material/dialog';

// @Component({
//   selector: 'app-user-management',
//   templateUrl: './user-management.component.html',
//   standalone: true,
//   imports: [CommonModule,ReactiveFormsModule, FormsModule],
//   styleUrls: ['./user-management.component.css']
// })  
// export class UserManagementComponent implements OnInit {
//   addUserForm!: FormGroup;
//   addPersonnelForm!: FormGroup;
//   divisions: any[] = [];
//   offices: any[] = [];
//   selectedPermissions: number[] = [];
//   users: any[] = []; // Store fetched users
//   currentPage: number = 1; // Track the current page
//   rowsPerPage: number = 8; // Maximum rows per page

//   isLoadingFetch: boolean = false;
//   isRegistering: boolean = false;
//   isAddingPersonnel: boolean = false;

//   isAddUserModalOpen = false; 
//   isAddPersonnelModalOpen = false;

//   // Administrator Sub-Permissions
//   adminSubPermissions = [
//     { id: 1.1, label: 'Edit User' },
//     { id: 1.2, label: 'Change User Password' },
//     { id: 1.3, label: 'Add User' },
//     { id: 1.4, label: 'Office Management' },
//     { id: 1.5, label: 'Add/Edit Permissions' },
//   ];


//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private notificationService: NotificationService
//   ) {
//     this.addUserForm = this.fb.group({
//       id_number: ['', Validators.required],
//       name: ['', Validators.required],
//       password: ['', Validators.required],
//       designation: ['', Validators.required],
//       division: ['', Validators.required],
//       office: ['', Validators.required]
//     });
//     this.addPersonnelForm = this.fb.group({
//       personnel_id: ['', Validators.required],
//       personnel_name: ['', Validators.required],
//       division: ['', Validators.required],
//     });
//   }

//   ngOnInit(): void {
//     this.addUserForm = this.fb.group({
//       id_number: ['', Validators.required],
//       name: ['', Validators.required],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       designation: ['', Validators.required],
//       division: ['', Validators.required],
//       office: ['', Validators.required],
//     });

//    this.addPersonnelForm = this.fb.group({
//      personnel_id: ['', Validators.required], 
//      personnel_name: ['', Validators.required],
//      division: ['', Validators.required],
//   });

//     // Fetch current user info
//     this.loadUserInfo();
//     this.loadDivisions();
//     this.loadOffices();
//     this.loadUsers();
//   }

//   loadUserInfo(): void {
//     this.authService.getUserInfo().subscribe(
//       (response: any) => {
//         if (response.status === 'success') {
//           this.isLoadingFetch = false;
//           const userData = response.data;
//         } else {
//           this.isLoadingFetch = false;
//           this.notificationService.showNotification('Failed to retrieve user info.', 'error');
//           console.error('Failed to retrieve user info');
//         }
//       },
//       (error) => {
//         this.isLoadingFetch = false;
//         this.notificationService.showNotification('Error fetching user info ' ,'error', + error);
//         console.error('Error fetching user info', error);
//       }
//     );
//   }

//   loadDivisions(): void {
//     this.authService.getDivisions().subscribe(
//       (response: any) => {
//         if (response.status === 'success') {
//           this.isLoadingFetch = false;
//           this.divisions = response.data; // Populate divisions array
//         } else {
//           this.isLoadingFetch = false;
//           this.notificationService.showNotification('Failed to fetch divisions.', 'error');
//           console.error('Failed to fetch divisions');
//         }
//       },
//       (error) => console.error('Error fetching divisions', error)
//     );
//   }

//   loadOffices(): void {
//     this.authService.getOffices().subscribe(
//       (response: any) => {
//         if (response.status === 'success') {
//           this.isLoadingFetch = false;
//           this.offices = response.data; // Populate offices array
//         } else {
//           this.isLoadingFetch = false;
//           this.notificationService.showNotification('Failed to fetch offices', 'error');
//           console.error('Failed to fetch offices');
//         }
//       },
//       (error) => console.error('Error fetching offices', error)
//     );
//   }

//   loadUsers(): void {
//     this.isLoadingFetch = true;
//     this.authService.getUsers().subscribe(
//       (response: any) => {
//         if (response.status === 'success') {
//           this.isLoadingFetch = false;
//           this.users = response.data;
//         } else {
//           this.isLoadingFetch = false;
//           this.notificationService.showNotification('Failed to fetch users', 'error');
//           console.error('Failed to fetch users');
//         }
//       },
//       (error) => console.error('Error fetching users', error),
//       () => {
//         this.isLoadingFetch = false; // Stop loading
//       }
//     );
//   }
  
//   // Method to handle pagination
//   getPaginatedUsers(): any[] {
//     const startIndex = (this.currentPage - 1) * this.rowsPerPage;
//     return this.users.slice(startIndex, startIndex + this.rowsPerPage);
//   }

//   changePage(direction: string): void {
//     if (direction === 'next' && (this.currentPage * this.rowsPerPage) < this.users.length) {
//       this.currentPage++;
//     } else if (direction === 'prev' && this.currentPage > 1) {
//       this.currentPage--;
//     }
//   }

//   // Function to open the modal
//   openAddUserModal() {
//     this.isAddUserModalOpen = true;
//   }

//   // Function to open the modal
//   openAddPersonnelModal() {
//     this.isAddPersonnelModalOpen = true;
//   }

//   // Function to close the modal
//   closeAddUserModal() {
//     this.isAddUserModalOpen = false;
//   }

//   // Function to close the modal
//   closeAddPersonnelModal() {
//     this.isAddPersonnelModalOpen = false;
//   }

//   togglePermission(permission: number): void {
//     const index = this.selectedPermissions.indexOf(permission);
//     if (index > -1) {
//       // Remove permission and its sub-permissions (if Administrator)
//       this.selectedPermissions.splice(index, 1);
//       if (permission === 1.6) {
//         this.adminSubPermissions.forEach((subPerm) => {
//           const subIndex = this.selectedPermissions.indexOf(subPerm.id);
//           if (subIndex > -1) {
//             this.selectedPermissions.splice(subIndex, 1);
//           }
//         });
//       }
//     } else {
//       // Add permission and automatically check all sub-permissions if Administrator
//       this.selectedPermissions.push(permission);
//       if (permission === 1.6) {
//         this.adminSubPermissions.forEach((subPerm) => {
//           if (!this.selectedPermissions.includes(subPerm.id)) {
//             this.selectedPermissions.push(subPerm.id);
//           }
//         });
//       }
//     }
//   }

//   toggleSubPermission(subPermission: number): void {
//     const index = this.selectedPermissions.indexOf(subPermission);

//     if (index > -1) {
//       // Remove sub-permission
//       this.selectedPermissions.splice(index, 1);

//       // Uncheck Administrator if no sub-permissions are selected
//       const anySubPermissionSelected = this.adminSubPermissions.some((subPerm) =>
//         this.selectedPermissions.includes(subPerm.id)
//       );
//       if (!anySubPermissionSelected) {
//         const adminIndex = this.selectedPermissions.indexOf(1.6);
//         if (adminIndex > -1) {
//           this.selectedPermissions.splice(adminIndex, 1);
//         }
//       }
//     } else {
//       // Add sub-permission
//       this.selectedPermissions.push(subPermission);

//       // Ensure Administrator is checked if any sub-permission is selected
//       if (!this.selectedPermissions.includes(1.6)) {
//         this.selectedPermissions.push(1.6);
//       }
//     }
//   }

//   registerUser(): void {
//     if (this.addUserForm.valid) {
//       const userData = {
//         ...this.addUserForm.value,
//         permissions: JSON.stringify(this.selectedPermissions),
//       };

//       this.isRegistering = true;
//       this.authService.register(userData).subscribe((response: any) => {
//         if (response.status === 'success') {
//           this.isRegistering = false;
//           this.notificationService.showNotification('User registered successfully.', 'success');
//           this.selectedPermissions = [];
//           this.addUserForm.reset();
//           this.closeAddUserModal();
//         } else {
//           this.isRegistering = false;
//           this.notificationService.showNotification('User registration failed. ' ,'error', + response.message);
//         }
//       });
//     } else {
//       this.isRegistering = false; 
//       this.notificationService.showNotification('Please fill out all required fields.', 'error');
//     }
//   }

//   saveAsPersonnel(): void {
//     if (this.addPersonnelForm.valid) {
//       const formData = this.addPersonnelForm.value;
//       const selectedDivision = this.divisions.find(
//         (division) => division.division_id === formData.division
//       );
  
//       if (!selectedDivision) {
//         this.notificationService.showNotification('Invalid division selected.', 'error');
//         // alert('Invalid division selected.');
//         return;
//       }
      
//       this.isAddingPersonnel = true;
//       const personnelData = {
//         personnel_id: formData.personnel_id, // Corrected to match formControlName
//         personnel_name: formData.personnel_name, // Corrected to match formControlName
//         division_id: formData.division,  // Save selected Division ID
//         division_name: selectedDivision.division_name, // Save Division Name
//       };
  
//       // Call service to save data to the database
//       this.authService.savePersonnel(personnelData).subscribe(
//         (response: any) => {
//           if (response.status === 'success') {
//             this.isAddingPersonnel = false;
//             this.notificationService.showNotification('Personnel has been added!', 'success');
//             this.addPersonnelForm.reset();
//             this.closeAddPersonnelModal();
//           } else {
//             this.isAddingPersonnel = false;
//             this.notificationService.showNotification('Failed to save personnel.', 'error');
//           }
//         },
//         (error) => {
//           this.isAddingPersonnel = false;
//           console.error('Error saving personnel:', error);
//           this.notificationService.showNotification('An error occured while saving personnel ' ,'error');
//         }
//       );
//     } else {
//       this.isAddingPersonnel = false;
//       this.notificationService.showNotification('Please fill out all required fields.', 'error');
//     }
//   }
// }
