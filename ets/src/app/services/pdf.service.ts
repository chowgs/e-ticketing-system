import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(private http: HttpClient) {}

    generatePdf(selectedReport: any, currentUser: any): Observable<Blob> {
        const url = '/api/ets/etsbackend/users/generatePdf'; 
        return this.http.post(url, { selectedReport, currentUser }, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            responseType: 'blob'
          });
    }
          
  
}
