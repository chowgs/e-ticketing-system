import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../shared/notification.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css'
})
export class UserSettingsComponent implements OnInit{
  /////////// User Settings 
  myAccountForm: FormGroup;
  passwordForm: FormGroup;
  selectedPermissions: number[] = [];
  isPasswordModalVisible: boolean = false;  // Flag to control modal visibility
  isPermissionsModalVisible: boolean = false; // Flag to control permissions modal visibility

  allPermissions: { id: number; label: string; children?: { id: number; label: string }[] }[] = [
    { id: 1.6, label: 'Administrator', children: [
      { id: 1.1, label: 'Edit User' },
      { id: 1.2, label: 'Change Password' },
      { id: 1.3, label: 'Add User (User Management Required!)' },
      { id: 1.4, label: 'Department Management' },
      { id: 1.5, label: 'Add/Edit Permissions' },
      { id: 1.7, label: 'User Management' },
      { id: 1.8, label: 'Add Personnel (User Management Required!)' },
    ]},
    { id: 1.9, label: 'Incoming Task' },
    { id: 2.1, label: 'Monitoring' },
    { id: 2.2, label: 'Dashboard' },
    { id: 2.3, label: 'PMS Log' },
    { id: 3.1, label: 'ICT Supervisor' },
    { id: 4.1, label: 'Office Supervisor' },
  ];
  
  // For showing the appropriate section based on permissions 
  showPermissionsSection: boolean = false;  
  showAccountSettingsSection: boolean = true;
  showChangePasswordSection: boolean = true;
  showUserManagement: boolean = true;
  showOfficeManagement: boolean = true;
  showAddUser: boolean = true;
  showAddPersonnel: boolean = true;

  // for loading account settings data 
  isLoading: boolean = false;
  isSaving: boolean = false;
  isChangingPassword: boolean = false;
  isAddingPerms: boolean = false;

  /////////// User Management 
  addUserForm!: FormGroup;
  addPersonnelForm!: FormGroup;
  divisions: any[] = [];
  offices: any[] = [];
  selectedAddPermissions: number[] = [];
  users: any[] = []; // Store fetched users

  currentPage: number = 1; // Track the current page
  rowsPerPage: number = 8; // Maximum rows per page

  isUserEditModalOpen = false;
  selectedUser: any = null;

  // Sub-Permissions
  adminSubPermissions = [
    { id: 1.1, label: 'Edit User' },
    { id: 1.2, label: 'Change User Password' },
    { id: 1.3, label: 'Add User' },
    { id: 1.4, label: 'Office Management' },
    { id: 1.5, label: 'Add/Edit Permissions' },
  ];
  
  // for loading users 
  isLoadingFetch: boolean = false;
  isRegistering: boolean = false;
  isAddingPersonnel: boolean = false;

  isAddUserModalOpen = false; 
  isAddPersonnelModalOpen = false;

  // Office Management 
  officeName: string = '';
  officeValue: string = '';
  divisionName: string = '';
  departments: any[] = [];
  isModalOpen = false;
  isEditModalOpen = false; // For edit modal
  isDivisionModalOpen = false;
  isEditDivisionModalOpen = false;
  selectedDivision: any = null;
  selectedOffice: any = null; 
  currentDeptPage: number = 1; // Track the current page
  rowsPerDeptPage: number = 8; // Maximum rows per page
  currentDivPage: number = 1; // Track the current page
  rowsPerDivPage: number = 8; // Maximum rows per page
  
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private notificationService: NotificationService) {
    this.myAccountForm = this.fb.group({
      idNumber: [{ value: '', disabled: true }],
      name: ['', [Validators.required]],
      designation: ['', Validators.required],
      office: ['', Validators.required],
      division: ['', Validators.required],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.addUserForm = this.fb.group({
      id_number: ['', Validators.required],
      name: ['', Validators.required],
      password: ['', Validators.required],
      designation: ['', Validators.required],
      division: ['', Validators.required],
      office: ['', Validators.required]
    });
    
    this.addPersonnelForm = this.fb.group({
      personnel_id: ['', Validators.required],
      personnel_name: ['', Validators.required],
      division: ['', Validators.required],
    });
  }

  ngOnInit(): void {
      // Get current user details from the backend and populate the form
      this.fetchPermissions();
      this.fetchDepartments();
      this.fetchDivisions();
      // fetch current user info 
      this.loadUserInfo();
      this.loadDivisions();
      this.loadOffices();
      this.loadUsers();
      
      this.authService.getUserInfo().subscribe((response: any) => {
        if (response.status === 'success') {
          this.myAccountForm.patchValue({
            idNumber: response.data.id_number, 
            name: response.data.name,
            designation: response.data.designation,
            office: response.data.office_id,  
            division: response.data.division_id,  
          });
          
          // Disable the idNumber control after setting the value
          this.myAccountForm.get('idNumber')?.disable();
        } else {
          alert('Failed to fetch user details');
        }
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

  }

  // update logged in user 
  saveChanges(): void {
    if (this.myAccountForm.invalid) {
      this.notificationService.showNotification('Please fill out all required fields.', 'error');
      return;
    }
    
    this.isSaving = true;
    const updatedData = this.myAccountForm.getRawValue(); 
    this.authService.updateUserInfo(updatedData).subscribe(
      (response: any) => {
        this.isSaving = false;
        if (response.status === 'success') {
          this.notificationService.showNotification('User information updated successfully.', 'success');
        } else {
          this.notificationService.showNotification('Failed to update user information: ' ,'error', + response.message);
        }
      },
      (error) => {
        this.isSaving = false;
        console.error('Error updating user information', error);
        this.notificationService.showNotification('An error occurred while updating your information.', 'error');
      }
    );
  }

  // Open Change Password Dialog
  openChangePasswordDialog(): void {
    this.isPasswordModalVisible = true;
  }

  // Close Change Password Dialog
  closeChangePasswordDialog(): void {
    this.isPasswordModalVisible = false;
  }

  // change password for both user and user with permission 
  changePassword(): void {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.notificationService.showNotification('Password do not match.', 'error');
      return;
    }

    this.isChangingPassword = true;
    this.authService.changePassword({ current_password: currentPassword, new_password: newPassword }).subscribe(
      (response: any) => {
        this.isChangingPassword = false;
        if (response.status === 'success') {
          this.notificationService.showNotification('Password updated successfully.', 'success');
          this.closeChangePasswordDialog();
          this.passwordForm.reset();
        } else {
          this.notificationService.showNotification('Failed to update user password: ', 'error', + response.message);
        }
      },
      (error) => {
        this.isChangingPassword = false;
        console.error('Error changing password', error);
        this.notificationService.showNotification('An error occurred while updating your password.', 'error');
      }
    );
  }

  // dialog for editing logged in user's permission 
  openPermissionsDialog(): void {
    this.isPermissionsModalVisible = true;
  }

  closePermissionsDialog(): void {
    this.isPermissionsModalVisible = false;
  }

  // fetch logged in user's permissions and display their corresponding settings based on their permissions. 
  fetchPermissions(): void {
    this.authService.getUserPermissions().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.selectedPermissions = response.permissions || [];

          // Check if any of the required permissions are present
          this.showAccountSettingsSection = this.selectedPermissions.includes(1.1);
          this.showChangePasswordSection =  this.selectedPermissions.includes(1.2); 
          this.showAddUser =  this.selectedPermissions.includes(1.3); 
          this.showOfficeManagement =  this.selectedPermissions.includes(1.4); 
          this.showPermissionsSection = this.selectedPermissions.includes(1.5);
          this.showUserManagement = this.selectedPermissions.includes(1.7);
          this.showAddPersonnel =  this.selectedPermissions.includes(1.8); 
        } else {
          alert('Failed to fetch permissions.');
        }
      },
      (error) => {
        console.error('Error fetching permissions', error);
      }
    );
  }

  // fetch selected user permissions for update 
  fetchPermissionsForSelectedUser(userId: number): void {
    this.authService.getUserPermissionsById(userId).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.selectedPermissions = response.permissions || [];
        } else {
          alert('Failed to fetch permissions.');
        }
      },
      (error) => {
        console.error('Error fetching permissions', error);
      }
    );
  }
  
  togglePermission(permission: number, children?: { id: number }[]): void {
    const index = this.selectedPermissions.indexOf(permission);
  
    if (index > -1) {
      // If permission is already selected, remove it
      this.selectedPermissions.splice(index, 1);
  
      // If it has children, remove them as well
      if (children) {
        children.forEach(child => {
          const childIndex = this.selectedPermissions.indexOf(child.id);
          if (childIndex > -1) {
            this.selectedPermissions.splice(childIndex, 1);
          }
        });
      }
    } else {
      // Add the selected permission
      this.selectedPermissions.push(permission);
  
      // If it has children, add them as well
      if (children) {
        children.forEach(child => {
          if (!this.selectedPermissions.includes(child.id)) {
            this.selectedPermissions.push(child.id);
          }
        });
      }
  
      // If a child is selected, ensure the parent (Administrator) is also selected
      const parent = this.allPermissions.find(p => p.children?.some(child => child.id === permission));
      if (parent && !this.selectedPermissions.includes(parent.id)) {
        this.selectedPermissions.push(parent.id);
      }
    }
  }

  // toggle selected user's permissions 
  toggleSelectedUserPermission(permission: number, children?: { id: number }[]): void {
    const index = this.selectedPermissions.indexOf(permission);
  
    if (index > -1) {
      // If permission is already selected, remove it
      this.selectedPermissions.splice(index, 1);
  
      // If it has children, remove them as well
      if (children) {
        children.forEach(child => {
          const childIndex = this.selectedPermissions.indexOf(child.id);
          if (childIndex > -1) {
            this.selectedPermissions.splice(childIndex, 1);
          }
        });
      }
    } else {
      // Add the selected permission
      this.selectedPermissions.push(permission);
  
      // If it has children, add them as well
      if (children) {
        children.forEach(child => {
          if (!this.selectedPermissions.includes(child.id)) {
            this.selectedPermissions.push(child.id);
          }
        });
      }
  
      // If a child is selected, ensure the parent (Administrator) is also selected
      const parent = this.allPermissions.find(p => p.children?.some(child => child.id === permission));
      if (parent && !this.selectedPermissions.includes(parent.id)) {
        this.selectedPermissions.push(parent.id);
      }
    }
  }
  

  // toggleSelectedUserPerms(permission: number, children?: { id: number }[]): void {
  //   const index = this.selectedPermissions.indexOf(permission);
  
  //   if (index > -1) {
  //     // If permission is already selected, remove it
  //     this.selectedPermissions.splice(index, 1);
  
  //     // If it has children, remove them as well
  //     if (children) {
  //       children.forEach(child => {
  //         const childIndex = this.selectedPermissions.indexOf(child.id);
  //         if (childIndex > -1) {
  //           this.selectedPermissions.splice(childIndex, 1);
  //         }
  //       });
  //     }
  //   } else {
  //     // Add the selected permission
  //     this.selectedPermissions.push(permission);
  
  //     // If it has children, add them as well
  //     if (children) {
  //       children.forEach(child => {
  //         if (!this.selectedPermissions.includes(child.id)) {
  //           this.selectedPermissions.push(child.id);
  //         }
  //       });
  //     }
  
  //     // If a child is selected, ensure the parent (Administrator) is also selected
  //     const parent = this.allPermissions.find(p => p.children?.some(child => child.id === permission));
  //     if (parent && !this.selectedPermissions.includes(parent.id)) {
  //       this.selectedPermissions.push(parent.id);
  //     }
  //   }
  // }
  
  // save current user's permissions 
  savePermissions(): void {
    this.isAddingPerms = true;
    this.authService.updateUserPermissions(this.selectedPermissions).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.isAddingPerms = false;
          this.notificationService.showNotification('Permissions updated successfully.', 'success');
          this.closePermissionsDialog();
          setTimeout(() => {
            // Trigger a page refresh after success
            window.location.reload();
          }, 1500);
        } else {
          this.isAddingPerms = false;
          this.notificationService.showNotification('Failed to permissions update successfully.', 'error');
        }
      },
      (error) => {
        this.isAddingPerms = false;
        this.notificationService.showNotification('Error updating permissions.', 'error');
      }
    );
  }

  //////////////////////////////// User Management 
  loadUserInfo(): void {
    this.authService.getUserInfo().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.isLoadingFetch = false;
          const userData = response.data;
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
    // this.isLoadingFetch = true;
    this.authService.getUsers().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.users = response.data;
        } else {
          this.notificationService.showNotification('Failed to fetch users', 'error');
          console.error('Failed to fetch users');
        }
      },
      (error) => console.error('Error fetching users', error),
      () => {
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

  // Function to open the modal
  openAddUserModal() {
    this.isAddUserModalOpen = true;
  }

  // Function to open the modal
  openAddPersonnelModal() {
    this.isAddPersonnelModalOpen = true;
  }

  // Function to close the modal
  closeAddUserModal() {
    this.isAddUserModalOpen = false;
  }

  // Function to close the modal
  closeAddPersonnelModal() {
    this.isAddPersonnelModalOpen = false;
  }

  toggleUserPermission(permission: number): void {
    const index = this.selectedAddPermissions.indexOf(permission);
    if (index > -1) {
      // Remove permission and its sub-permissions (if Administrator)
      this.selectedAddPermissions.splice(index, 1);
      if (permission === 1.6) {
        this.adminSubPermissions.forEach((subPerm) => {
          const subIndex = this.selectedAddPermissions.indexOf(subPerm.id);
          if (subIndex > -1) {
            this.selectedAddPermissions.splice(subIndex, 1);
          }
        });
      }
    } else {
      // Add permission and automatically check all sub-permissions if Administrator
      this.selectedAddPermissions.push(permission);
      if (permission === 1.6) {
        this.adminSubPermissions.forEach((subPerm) => {
          if (!this.selectedAddPermissions.includes(subPerm.id)) {
            this.selectedAddPermissions.push(subPerm.id);
          }
        });
      }
    }
  }

  toggleSubPermission(subPermission: number): void {
    const index = this.selectedAddPermissions.indexOf(subPermission);

    if (index > -1) {
      // Remove sub-permission
      this.selectedAddPermissions.splice(index, 1);

      // Uncheck Administrator if no sub-permissions are selected
      const anySubPermissionSelected = this.adminSubPermissions.some((subPerm) =>
        this.selectedAddPermissions.includes(subPerm.id)
      );
      if (!anySubPermissionSelected) {
        const adminIndex = this.selectedAddPermissions.indexOf(1.6);
        if (adminIndex > -1) {
          this.selectedAddPermissions.splice(adminIndex, 1);
        }
      }
    } else {
      // Add sub-permission
      this.selectedAddPermissions.push(subPermission);

      // Ensure Administrator is checked if any sub-permission is selected
      if (!this.selectedAddPermissions.includes(1.6)) {
        this.selectedAddPermissions.push(1.6);
      }
    }
  }

  registerUser(): void {
    if (this.addUserForm.valid) {
      const userData = {
        ...this.addUserForm.value,
        permissions: JSON.stringify(this.selectedAddPermissions),
      };

      this.isRegistering = true;
      this.authService.register(userData).subscribe((response: any) => {
        if (response.status === 'success') {
          this.isRegistering = false;
          this.notificationService.showNotification('User registered successfully.', 'success');
          this.selectedAddPermissions = [];
          this.addUserForm.reset();
          this.closeAddUserModal();
          setTimeout(() => {
            // Trigger a page refresh after success
            window.location.reload();
          }, 1500);
        } else {
          this.isRegistering = false;
          this.notificationService.showNotification('User registration failed. ' ,'error', + response.message);
        }
      });
    } else {
      this.isRegistering = false; 
      this.notificationService.showNotification('Please fill out all required fields.', 'error');
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
            this.addPersonnelForm.reset();
            this.closeAddPersonnelModal();
            setTimeout(() => {
              // Trigger a page refresh after success
              window.location.reload();
            }, 1500);
          } else {
            this.isAddingPersonnel = false;
            this.notificationService.showNotification('Failed to save personnel.', 'error');
          }
        },
        (error) => {
          this.isAddingPersonnel = false;
          console.error('Error saving personnel:', error);
          this.notificationService.showNotification('An error occured while saving personnel ' ,'error');
        }
      );
    } else {
      this.isAddingPersonnel = false;
      this.notificationService.showNotification('Please fill out all required fields.', 'error');
    }
  }

  // update selected user 
  updateUser(): void {
    if (this.selectedUser && this.selectedUser.name.trim()) {
      // Include selectedPermissions in the request data
      this.selectedUser.permissions = this.selectedPermissions; 
  
      this.isChangingPassword = true;
  
      this.authService.updateUser(this.selectedUser).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.notificationService.showNotification('User information saved successfully', 'success');
            this.closeUserEditModal();
          } else {
            this.notificationService.showNotification(`Failed to update user: ${response.message}`, 'error');
          }
        },
        (error) => {
          console.error('Error updating user:', error);
          this.notificationService.showNotification('An error occurred while updating user', 'error');
        },
        () => {
          this.isChangingPassword = false;
        }
      );
    } else {
      this.notificationService.showNotification('Please enter a valid user', 'error');
    }
  }

  openUserEditModal(user: any) {
    this.selectedUser = { ...user };
    this.isUserEditModalOpen = true;
    this.fetchPermissionsForSelectedUser(user.id_number);  // Fetch permissions for the selected user
  }

  closeUserEditModal() {

    this.isUserEditModalOpen = false;
  }


  ////////////////////////////// Office Management 
  fetchDepartments(): void {
    this.isLoadingFetch = true; // Start loading
    this.authService.getAllOffices().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.departments = response.data;
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

  fetchDivisions(): void {
    this.isLoadingFetch = true; // Start loading
    this.authService.getDivisions().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.divisions = response.data;
        } else {
          console.error('Failed to fetch division');
        }
      },
      (error) => {
        console.error('Error fetching divisions:', error);
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

  openDivisionModal() {
    this.isDivisionModalOpen = true;
  }

  // Function to close the modal
  closeDivisionModal() {
    this.isDivisionModalOpen = false;
    this.isEditDivisionModalOpen = false;
  }

  addOffice(): void {
    if (this.officeName.trim() && this.officeValue.trim()) {
      this.isChangingPassword = true; // Start loading
      const officeData = {
        office_name: this.officeName.toUpperCase(),
        office_value: this.officeValue  // Add office_value to the data object
      };
  
      this.authService.addOffice(officeData).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.notificationService.showNotification('Office has been added!', 'success');
            this.officeName = ''; // Reset the input field
            this.officeValue = ''; // Reset the office value input
            this.fetchDepartments(); // Refresh the list of offices
            this.closeModal();
          } else if (response.message === 'Office already exists.') {
            this.notificationService.showNotification('Office already exists.', 'error');
          } else {
            this.notificationService.showNotification(`Failed to add office: ${response.message}`, 'error');
          }
        },
        (error) => {
          console.error('Error adding office:', error);
          this.notificationService.showNotification('An error occurred while adding office', 'error');
        },
        () => {
          this.isChangingPassword = false; // Stop loading
        }
      );
    } else {
      this.notificationService.showNotification('Please fill in both office name and value', 'error');
    }
  }

  addDivision(): void {
    if (this.divisionName.trim()) {
      this.isChangingPassword = true; // Start loading
      const divisionData = {
        division_name: this.divisionName.toUpperCase(), // Make sure the key is 'division_name'
      };
  
      this.authService.addDivision(divisionData).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.notificationService.showNotification('Division has been added!', 'success');
            this.divisionName = ''; // Reset the input field
            this.fetchDivisions(); // Refresh the list of divisions
            this.closeDivisionModal(); // Close the modal
          } else if (response.message === 'Division already exists.') {
            this.notificationService.showNotification('Division already exists.', 'error');
          } else {
            this.notificationService.showNotification(`Failed to add division: ${response.message}`, 'error');
          }
        },
        (error) => {
          console.error('Error adding division:', error);
          this.notificationService.showNotification('An error occurred while adding division', 'error');
        },
        () => {
          this.isChangingPassword = false; // Stop loading
        }
      );
    } else {
      this.notificationService.showNotification('Please fill in the division name', 'error');
    }
  }

  openEditDivisionModal(division: any) {
    this.selectedDivision = { ...division };
    this.isEditDivisionModalOpen = true;
  }

  closeEditDivisionModal(){
    this.selectedDivision = null;
    this.isEditDivisionModalOpen = false;    
  }

  updateDivision(): void {
    if (this.selectedDivision.division_name.trim()) {
      // Ensure office values are formatted and passed
      this.selectedDivision.division_name = this.selectedDivision.division_name.toUpperCase();
  
      this.isChangingPassword = true;
  
      this.authService.updateDivision(this.selectedDivision).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.notificationService.showNotification(
              'Department updated successfully!',
              'success'
            );
            this.fetchDivisions(); // Refresh the list
            this.closeEditDivisionModal();
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
          this.isChangingPassword = false;
        }
      );
    } else {
      this.notificationService.showNotification(
        'Please enter a valid office name, division name, and office value',
        'error'
      );
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
    if (this.selectedOffice && this.selectedOffice.office_name.trim() && this.selectedOffice.office_value.trim()) {
      // Ensure office values are formatted and passed
      this.selectedOffice.office_name = this.selectedOffice.office_name.toUpperCase();
      this.selectedOffice.office_value = this.selectedOffice.office_value.toUpperCase();
  
      this.isChangingPassword = true;
  
      this.authService.updateOffice(this.selectedOffice).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.notificationService.showNotification(
              'Department updated successfully!',
              'success'
            );
            this.fetchDepartments(); // Refresh the list
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
          this.isChangingPassword = false;
        }
      );
    } else {
      this.notificationService.showNotification(
        'Please enter a valid office name, division name, and office value',
        'error'
      );
    }
  }
  
  // Method to handle pagination
  getPaginatedOffices(): any[] {
    const startIndex = (this.currentDeptPage - 1) * this.rowsPerDeptPage;
    return this.departments.slice(startIndex, startIndex + this.rowsPerDeptPage);
  }

  changeDeptPage(direction: string): void {
    if (direction === 'next' && (this.currentDeptPage * this.rowsPerDeptPage) < this.departments.length) {
      this.currentDeptPage++;
    } else if (direction === 'prev' && this.currentDeptPage > 1) {
      this.currentDeptPage--;
    }
  }

  getPaginatedDivisions(): any[] {
    const startIndex = (this.currentDivPage - 1) * this.rowsPerDivPage;
    return this.divisions.slice(startIndex, startIndex + this.rowsPerDivPage);
  }

  changeDivPage(direction: string): void {
    if (direction === 'next' && (this.currentDivPage * this.rowsPerDivPage) < this.divisions.length) {
      this.currentDivPage++;
    } else if (direction === 'prev' && this.currentDivPage > 1) {
      this.currentDivPage--;
    }
  }

}
