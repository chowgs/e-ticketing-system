import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';

const API_URL = '/api/ets/etsbackend';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'authToken'; // Store token locally (or session)
  private readonly USER_PERMISSIONS_KEY = 'permissions'; // New key for permissions

  constructor(private http: HttpClient, private router: Router) {}

  // Store auth token after login
  setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  // Get auth token
  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }
  setUserPermissions(permissions: string[]): void {
    localStorage.setItem(this.USER_PERMISSIONS_KEY, JSON.stringify(permissions)); // Store permissions as JSON string
  }
  getCurrentUserPermissions(): Observable<string[]> {
    const permissions = JSON.parse(localStorage.getItem(this.USER_PERMISSIONS_KEY) || '[]');
    return new Observable((observer) => {
      observer.next(permissions);
      observer.complete();
    });
  }
  
  // Check if the user is logged in by verifying session or token for auth
  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken'); 
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken(); // Returns true if token exists
  }
 
  // Clear auth token during logout
  clearAuthToken(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_PERMISSIONS_KEY);
  }

  login(userData: any): Observable<any> {
    return this.http.post(API_URL + '/users/login', userData).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          this.setAuthToken(response.token); // Store token on success
          this.setUserPermissions(response.permissions);
          console.log('User permissions set:', response.permissions); // Log permissions

        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(API_URL + '/users/logout', {}).pipe(
      tap(() => this.clearAuthToken()) // Clear token on successful logout
    );
  }
  
  // Change user password service
  changePassword(passwordData: any): Observable<any> {
    return this.http.post(API_URL + '/users/changePassword', passwordData, httpOptions);
  }

  changeUserPassword(currentPassword: string, newPassword: string): Observable<any> {
    const payload = { current_password: currentPassword, new_password: newPassword };
    return this.http.post<any>(API_URL + '/users/changePassword', payload, httpOptions);
  }
  // update logged in user's info service
  updateUserInfo(data: any): Observable<any> {
    return this.http.post(API_URL + '/users/updateUserInfo', data, httpOptions);
  }

  // fetch all the permissions for logged in users service
  getUserPermissions(): Observable<any> {
    return this.http.get(API_URL + '/users/getUserPermissions', httpOptions);
  }
  // fetch selected user permissions for editing
  getUserPermissionsById(userId: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/users/getUserPermissionsById/${userId}`, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Error fetching permissions for user', error);
        return of({ status: 'fail', message: 'Failed to fetch user permissions' }); // Return fallback response
      })
    );
  }
  
  // update logged in user's perms service
  updateUserPermissions(permissions: number[]): Observable<any> {
    return this.http.post(API_URL + '/users/updateUserPermissions', { permissions }, httpOptions);
  }
  
  // Add a new user to table 'users' service
  register(userData: any): Observable<any> {
    return this.http.post(API_URL + '/users/register', userData, httpOptions);
  }

// fetch all users 
  getUsers(): Observable<any> {
    return this.http.post(API_URL + '/users/getUsers', {}, httpOptions);
  }
  
  // Get user data from the table 'users' service
  getUserInfo(): Observable<any> {
    return this.http.get(API_URL + '/users/getUserInfo', httpOptions);
  }

  // Submit issue from client to suspervisor service
  submitIssue(issueData: any): Observable<any> {
    return this.http.post(API_URL + '/users/submitIssue', issueData, httpOptions);
  }  

  // Get User Permissions service
  getUserPerms(): Observable<any> {
    return this.http.get(API_URL + '/users/getUserPerms', httpOptions);
  }

  // check user permission if supervisor then direct them accordingly 
  getPermissionsAndRedirect(): Observable<void> {
    return this.getUserPerms().pipe(
      map(response => {
        if (response.status === 'success') {
          const permissions = response.data.permissions;
  
          if (permissions.includes('3.1')) {
            // User has permission 3.1, redirect to 'technical-supervisor'
            this.router.navigate(['/technical-supervisor']);
          } else if (permissions.includes('4.1')) {
            // User has permission 4.1, redirect to 'head-supervisor'
            this.router.navigate(['/head-supervisor']);
          } else {
            // Default route, can be a generic dashboard or some default page
            this.router.navigate(['/dashboard']);
          }
        }
      }),
      catchError((error) => {
        console.error('Error fetching user permissions', error);
        // Return an empty observable to fulfill the `Observable<void>` return type
        return of(undefined);  // This resolves to `void`, which matches the return type
      })
    );
  }

  // get division service
  getDivisions(): Observable<any> {
    return this.http.get(API_URL + '/users/getDivisions', httpOptions);
  } 

  // fetch office service
  getOffices() {
    return this.http.get(API_URL + '/users/getOffice', httpOptions);
  }

  updateOffice(office: any): Observable<any> {
    return this.http.post(API_URL + '/users/updateOffice', office, httpOptions);
  }  

  updateDivision(division: any): Observable<any> {
    return this.http.post(API_URL + '/users/updateDivision', division, httpOptions);
  }  

  // update selected user on administrator 
  updateUser(users: any): Observable<any> {
    return this.http.post(API_URL + '/users/updateUser', users, httpOptions);
  }  

  getAllOffices(): Observable<any> {
    return this.http.post(API_URL + '/users/getAllOffices', {}, httpOptions);
  }  
  
  // add office service
  addOffice(officeData: any): Observable<any> {
    return this.http.post(API_URL + '/users/addOffice', officeData, httpOptions);
  } 

  addDivision(divisionData: any): Observable<any> {
    return this.http.post(API_URL + '/users/addDivision', divisionData, httpOptions);
  } 

  fetchAcceptedReports(): Observable<any> {
    return this.http.get<any>(API_URL +  '/users/fetchAcceptedReports', httpOptions);
  }
  
  savePersonnel(personnelData: any): Observable<any> {
    return this.http.post(API_URL + '/users/savePersonnel', personnelData, httpOptions);
  }

  // // fetch logged in users division id and display personnel names on dropdown in monitor 
  getPersonnelByDivision() {
    return this.http.get<{status: string, data?: any[], message?: string}>(API_URL + '/users/getPersonnelByDivision', httpOptions);
  }
  
  // store the personnel name to their specified table 
  assignPersonnelToReport(controlNo: string, personnelId: string) {
    return this.http.post<{ status: string, message?: string }>(API_URL + '/users/assignPersonnelToReport', {
      control_no: controlNo,
      personnel_id: personnelId
    }, httpOptions);
  }



  // // Login service 
  // login(userData: any): Observable<any> {
  //   return this.http.post(API_URL+'/users/login', userData, httpOptions);
  // }

  // // logout service 
  // logout(): Observable<any> {
  //   return this.http.post(`${API_URL}/users/logout`, {}, httpOptions);
  // }

  // monitor serviice 
  // getReportsByDivision(): Observable<any> {
  //   return this.http.get(API_URL + '/users/getReportsByDivision', httpOptions);
  // }

  // IT Repair & Maintenance service reports data
  // getServiceReports(): Observable<any> {
  //   return this.http.get(API_URL + '/itrmserviceReport/getServiceReports', httpOptions);
  // }

  
}
