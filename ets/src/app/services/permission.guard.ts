import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service'; // AuthService that handles permissions
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators'; // Import operators for subscription handling

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const requiredPermission = next.data['requiredPermission']; // Retrieve required permission from route
    console.log('Required permission for this route:', requiredPermission);
  
    return this.authService.getCurrentUserPermissions().pipe(
      map((userPermissions: string[]) => {
        console.log('User permissions:', userPermissions);
        if (userPermissions.includes(requiredPermission)) {
          return true; // Access granted
        } else {
          this.router.navigate(['/access-denied']); // Redirect to a "not authorized" page if access is denied
          return false; // Deny access
        }
      }),
      catchError((error) => {
        console.error('Error checking permissions:', error);
        this.router.navigate(['/access-denied']); // Redirect to access-denied page if an error occurs
        return [false]; // Deny access
      })
    );
  }
  
}
