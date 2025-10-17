import { Component } from '@angular/core';
import {ColognesListComponent} from "../../../shop/components/colognes-list/colognes-list.component";
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'app-admin',
    imports: [
        ColognesListComponent
    ],
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
