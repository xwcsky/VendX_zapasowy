import { Component } from '@angular/core'; import { ColognesListComponent } from '../../components/colognes-list/colognes-list.component';
import { AuthService } from '../../../auth/auth.service'; import { QRCodeComponent } from 'angularx-qrcode';
import { ConfigurationService } from '../../../common/services/configuration.service';
import { BreadcrumbsComponent } from '../../../breadcrumbs/breadcrumbs'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

   @Component(
    { selector: 'app-shop',
      standalone: true,
      imports: [ColognesListComponent, QRCodeComponent, BreadcrumbsComponent, FormsModule, CommonModule],
      templateUrl: './shop.component.html', styleUrl: './shop.component.scss' }
        
      ) export class ShopComponent { cologneId: string | undefined; payConfirmed: boolean = false;
         constructor(public authService: AuthService)
          { } logout(): void { this.authService.logout(); } 

          setCologneId(cologneId: string | undefined): void { this.cologneId = cologneId; } 

          showPaymentStep = false;

          confirmPayment(): void {
            this.resetPaymentState();

            this.payConfirmed = true;
            this.showPaymentStep = true;
         
          }
          onBreadcrumbClick(url: string) {
            this.resetPaymentState();
            this.payConfirmed = false;
          } 
            discountCode = '';
            discountPercent = 0;
            qrReady = false;
            qrData = '';

            applyDiscount() {
               if (this.discountCode === 'TEST50') {
                 this.discountPercent = 50;
               } else {
                 this.discountPercent = 0;
                 alert('Niepoprawny kod rabatowy');
               }
               this.generateQr();
             }
             

            generateQr() {
               // najpierw reset starego QR
               this.qrReady = false;
               this.qrData = '';
             
               const baseUrl = ConfigurationService.getHostUrl() + '/payment';
               const payload = {
                 cologneId: this.cologneId,
                 discount: this.discountPercent
               };
             
               // mały timeout, żeby Angular odświeżył DOM
               setTimeout(() => {
                 this.qrData = baseUrl + '?data=' + encodeURIComponent(JSON.stringify(payload));
                 this.qrReady = true;
               }, 0);
             }
             resetPaymentState() {
               this.discountCode = '';
               this.discountPercent = 0;
               this.qrReady = false;
               this.qrData = '';
               this.payConfirmed = false;
               this.showPaymentStep = false;
             }

             
             
             
           readonly ConfigurationService = ConfigurationService; }