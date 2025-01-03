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

export class TaskService {

  constructor(private http: HttpClient) {}

  fetchReportsForCurrentUser(): Observable<any> {
    return this.http.get<{ status: string, message?: string, data?: any[] }>(
      `${API_URL}/users/fetchReportsForCurrentUser`,
      httpOptions
    );
  }

  fetchAllOffices(): Observable<any> {
    return this.http.get<any>(API_URL + '/users/fetchAllOffices', httpOptions);
  }
  
  // update pending form to for release 
  updateReport(report: any): Observable<any> {
    return this.http.put(`${API_URL}/users/updateItrmServiceReport/${report.control_no}`, report, httpOptions);
  }

  // update for release form to released
  updateForReleaseForm(report: any): Observable<any> {
    return this.http.put(`${API_URL}/users/updateItrmServiceReportRequestStatus/${report.control_no}`, report, httpOptions);
  }

  saveSignature(signatureData: { reportId: number; signature: string }): Observable<any> {
    return this.http.post(`${API_URL}/users/saveSignature`, signatureData, httpOptions);
  }

  


}
