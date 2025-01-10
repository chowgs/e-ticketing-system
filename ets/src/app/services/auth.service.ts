import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const API_URL = '/api/ets/etsbackend';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'authToken'; // Store token locally (or session)
  private userPermissions: number[] = [];

  constructor(private http: HttpClient) {}

  // Store auth token after login
  setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  // Get auth token
  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  // Check if the user is logged in by verifying session or token
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
  }

  login(userData: any): Observable<any> {
    return this.http.post(API_URL + '/users/login', userData).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          this.setAuthToken(response.token); // Store token on success
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

  // update logged in user's info service
  updateUserInfo(data: any): Observable<any> {
    return this.http.post(API_URL + '/users/updateUserInfo', data, httpOptions);
  }

  // fetch all the permissions for logged in users service
  getUserPermissions(): Observable<any> {
    return this.http.get(API_URL + '/users/getUserPermissions', httpOptions);
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

  // get division service
  getDivisions(): Observable<any> {
    return this.http.get(API_URL + '/users/getDivisions', httpOptions);
  } 

  // fetch office service
  getOffices() {
    return this.http.get(API_URL + '/users/getOffice', httpOptions);
  }

  updateOffice(office: any): Observable<any> {
    return this.http.post(API_URL + '/users/updateOffice', office);
  }  

  getAllOffices(): Observable<any> {
    return this.http.post(API_URL + '/users/getAllOffices', {}, httpOptions);
  }  
  
  // add office service
  addOffice(officeData: any): Observable<any> {
    return this.http.post(API_URL + '/users/addOffice', officeData, httpOptions);
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
