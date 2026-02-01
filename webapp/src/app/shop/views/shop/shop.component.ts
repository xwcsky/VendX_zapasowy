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

        quantity: number = 1;

         constructor(public authService: AuthService)
          { } logout(): void { this.authService.logout(); } 

          setCologneId(cologneId: string | undefined): void { this.cologneId = cologneId; } 

          showPaymentStep = false;

          confirmPayment(): void {
            this.resetPaymentState();

            this.payConfirmed = true;
            this.showPaymentStep = true;
         
            this.generateQr();
          }

          increaseQuantity() {
            if (this.quantity < 5) { // Limit np. do 5
              this.quantity++;
              this.generateQr(); // Odśwież QR od razu po zmianie!
            }
          }

          decreaseQuantity() {
            if (this.quantity > 1) {
              this.quantity--;
              this.generateQr(); // Odśwież QR
            }
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
              this.qrReady = false;
              this.qrData = '';
          
              // Upewnij się, że ścieżka to /payment/pay (zgodnie z routingiem)
              const baseUrl = ConfigurationService.getHostUrl() + '/payment/pay';
              
              // Zamiast pakować w JSON, budujemy normalne parametry URL
              // PayComponent oczekuje: scentId, deviceId, quantity
              const scentId = this.cologneId;
              const deviceId = 'test-device-01'; // Tymczasowo na sztywno
              const quantity = this.quantity;
          
              // Budujemy pełny URL
              const finalUrl = `${baseUrl}?scentId=${scentId}&deviceId=${deviceId}&quantity=${quantity}`;
          
              // Mały timeout dla odświeżenia widoku
              
                this.qrData = finalUrl;
                this.qrReady = true;
                console.log('Wygenerowano QR dla URL:', this.qrData);
              
            }

             resetPaymentState() {
               this.discountCode = '';
               this.discountPercent = 0;
               this.qrReady = false;
               this.qrData = '';
               this.payConfirmed = false;
               this.showPaymentStep = false;
               this.quantity = 1;
             }

             
             
             
           readonly ConfigurationService = ConfigurationService; }