import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; import { ColognesListComponent } from '../../components/colognes-list/colognes-list.component';
import { AuthService } from '../../../auth/auth.service'; import { QRCodeComponent } from 'angularx-qrcode';
import { ConfigurationService } from '../../../common/services/configuration.service';
import { BreadcrumbsComponent } from '../../../breadcrumbs/breadcrumbs'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColognesApiService } from '../../services/colognes-api.service';
import { OrdersApiService } from '../../services/orders-api.service';
import { SocketService } from '../../../common/services/socket.service';
import { Router } from '@angular/router';

   @Component(
    { selector: 'app-shop',
      standalone: true,
      imports: [ColognesListComponent, QRCodeComponent, BreadcrumbsComponent, FormsModule, CommonModule],
      templateUrl: './shop.component.html', styleUrl: './shop.component.scss' }
        
      ) export class ShopComponent implements OnInit, OnDestroy { cologneId: string | undefined; payConfirmed: boolean = false;

        quantity: number = 1;
        deviceId = 'test-device-01'; // To powinno być w konfiguracji, ale na razie ok
        dispensing = false; // Flaga, czy trwa wydawanie
        private socketSub: any;

         constructor(
          private router: Router,
          public authService: AuthService,
          private socketService: SocketService,
          private apiService: ColognesApiService, 
          private ordersApiService: OrdersApiService,
          private cdr: ChangeDetectorRef
        )
          { } logout(): void { this.authService.logout(); } 

          ngOnInit() {
            // 👇 1. Kiosk dołącza do nasłuchiwania na swoje zdarzenia
            this.socketService.joinDeviceRoom(this.deviceId);
        
            // 👇 2. Czekamy na sygnał "START_PUMP" (czyli opłacono)
            this.socketSub = this.socketService.onPumpCommand().subscribe((data) => {
               console.log('🎉 Kiosk odebrał płatność! Wydawanie...', data);
               this.handleDispenseSuccess();
            });
          }

          ngOnDestroy() {
            if (this.socketSub) this.socketSub.unsubscribe();
          }

          handleDispenseSuccess() {
            this.dispensing = true; // Możesz użyć tego w HTML żeby pokazać inny ekran
            this.qrReady = false;   // Ukryj QR
            this.cdr.detectChanges();
        
            // Po 5 sekundach (czas na "psiknięcie") wracamy do wygaszacza
            setTimeout(() => {
              this.router.navigate(['/screensaver']);
            }, 5000);
          }

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
              if (!this.discountCode) return;
          
              this.apiService.validateDiscount(this.discountCode).subscribe({
                next: (res) => {
                  // Backend potwierdził kod
                  this.discountPercent = res.percent;
                  console.log(`Kod poprawny: ${res.code}, Zniżka: ${res.percent}%`);
                  
                  // Jeśli 100%, odświeżamy widok (QR zniknie, bo obsłużymy to inaczej)
                  if (this.discountPercent === 100) {
                     this.quantity = 1; // Reset ilości lub zostaw jak chcesz
                     this.generateQr(); // Przeładuj logikę
                  } else if (this.discountPercent > 0) {
                    this.generateQr();
                 }
                 this.cdr.detectChanges();
                },
                error: (err: any) => {
                  console.error('Błąd kodu:', err);
                  this.discountPercent = 0;
                  alert('Kod nieprawidłowy lub wyczerpany!');
                  this.cdr.detectChanges();
                }
              });
            }
             

             generateQr() {
              this.qrReady = false;
              this.qrData = '';
          
              const baseUrl = ConfigurationService.getHostUrl() + '/payment/pay';
              const scentId = this.cologneId;
              const deviceId = 'test-device-01'; // Tymczasowo na sztywno
              const quantity = this.quantity;
          
              // Budujemy pełny URL
              let finalUrl = `${baseUrl}?scentId=${scentId}&deviceId=${deviceId}&quantity=${quantity}`;
          
              if (this.discountPercent > 0) {
                finalUrl += `&discountCode=${this.discountCode}`;
             }
              
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

             
             adminFreeDispense() {
              if (!this.cologneId) return;
            
              const orderData = {
                scentId: this.cologneId,
                deviceId: 'test-device-01',
                quantity: this.quantity,
                discountCode: this.discountCode // Przekazujemy kod
              };
            
              // Używamy serwisu orders-api (musisz go wstrzyknąć w konstruktorze)
              this.ordersApiService.createOrder(orderData).subscribe({
                next: (res: any) => {
                   console.log('Darmowe zamówienie poszło!', res);
                   // Przekieruj na screensaver lub pokaż sukces
                   alert('Maszyna uruchomiona!');
                   // Tu możesz dodać logikę powrotu do screensavera
                },
                error: (err: any) => alert('Błąd: ' + err.message)
              });
            }
             
             
           readonly ConfigurationService = ConfigurationService; }