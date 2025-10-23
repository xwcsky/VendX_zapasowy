import { Component } from '@angular/core';
import {ColognesListComponent} from '../../components/colognes-list/colognes-list.component';
import {AuthService} from '../../../auth/auth.service';
import {QRCodeComponent} from 'angularx-qrcode';
import {ConfigurationService} from '../../../common/services/configuration.service';

@Component({
  selector: 'app-shop',
  imports: [
    ColognesListComponent,
    QRCodeComponent
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {
  cologneId: string | undefined;

  constructor(
    public authService: AuthService
  ){
  }

  logout(): void {
    this.authService.logout();
  }

  setCologneId(cologneId: string | undefined): void {
    this.cologneId = cologneId;
  }

  protected readonly ConfigurationService = ConfigurationService;
}
