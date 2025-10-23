import { Component } from '@angular/core';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  constructor(
    public authService: AuthService
  ){
  }

  logout(): void {
    this.authService.logout();
  }
}
