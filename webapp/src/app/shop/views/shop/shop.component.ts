import { Component } from '@angular/core'; import { ColognesListComponent } from '../../components/colognes-list/colognes-list.component';
import { AuthService } from '../../../auth/auth.service'; import { QRCodeComponent } from 'angularx-qrcode';
import { ConfigurationService } from '../../../common/services/configuration.service';
import { BreadcrumbsComponent } from '../../../breadcrumbs/breadcrumbs'; 
   @Component(
    { selector: 'app-shop',
       imports: [ColognesListComponent, QRCodeComponent, BreadcrumbsComponent],
        templateUrl: './shop.component.html', styleUrl: './shop.component.scss' }
        
      ) export class ShopComponent { cologneId: string | undefined; payConfirmed: boolean = false;
         constructor(public authService: AuthService)
          { } logout(): void { this.authService.logout(); } 

          setCologneId(cologneId: string | undefined): void { this.cologneId = cologneId; } 

          showPaymentStep = false;

          confirmPayment(): void {
             this.payConfirmed = true;
             this.showPaymentStep = true;
          }
          onBreadcrumbClick(url: string) {
            this.payConfirmed = false;
          }          
           readonly ConfigurationService = ConfigurationService; }