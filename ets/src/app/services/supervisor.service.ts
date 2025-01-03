import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = '/api/ets/etsbackend';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class SupervisorService {
  constructor(private http: HttpClient) {}

  // fetch job request according to user's office_id service
  getJobRequests(): Observable<any> {
    return this.http.get(API_URL + '/users/getJobRequests', httpOptions);
  }

  // update column from itrm_service_report approval_status to "1" 
  updateApprovalStatus(requestId: number): Observable<any> {
    return this.http.post<any>(API_URL + '/users/updateApprovalStatus', { id: requestId, approval_status: 1 }, httpOptions);
  }
  
  // fetch approved reports from itrm_service_report with approval_status of "1" 
  getApprovedReports(): Observable<any> {
    return this.http.get<any>(API_URL + '/users/getApprovedReports', httpOptions); 
  }

  acceptJobRequest(report: any): Observable<any> {
    return this.http.post(API_URL + '/users/acceptJobRequest', report, httpOptions);
  }
  
  
  // get service office id
  // getServiceReportsByOfficeId(): Observable<any> {
  //   return this.http.get(API_URL + '/users/getServiceReportsByOfficeId', httpOptions);
  // }

}
