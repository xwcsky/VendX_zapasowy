import { Component } from '@angular/core';
import {ColognesListComponent} from '../../components/colognes-list/colognes-list.component';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'app-shop',
  imports: [
    ColognesListComponent
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {
  constructor(
    public authService: AuthService
  ){
  }

  logout(): void {
    this.authService.logout();
  }
}
