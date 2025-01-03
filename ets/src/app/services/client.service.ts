import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = '/api/ets/etsbackend';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient) { }

  getDivisions(): Observable<any> {
    return this.http.get(API_URL + '/client/getDivisions', httpOptions);
  }

  getOffices(): Observable<any> {
    return this.http.get(API_URL + '/client/getOffices', httpOptions);
  }

  // submits request from Office Supervisor
  submitRequest(requestData: any): Observable<any> {
    return this.http.post(API_URL + '/client/createServiceReport', requestData, httpOptions);
  }

  // fetch data based on the search bar input value 
  getServiceReport(searchTerm: string): Observable<any> {
    return this.http.get(`${API_URL}/client/getServiceReport?q=${searchTerm}`, httpOptions);
  }
  
  saveSignature(signatureData: { reportId: number; signature: string }): Observable<any> {
    return this.http.post(`${API_URL}/client/saveSignature`, signatureData, httpOptions);
}

  

}
