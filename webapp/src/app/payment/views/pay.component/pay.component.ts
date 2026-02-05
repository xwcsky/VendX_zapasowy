import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OSType } from '../../../common/model/enums';
import { ApplePayButtonComponent } from '../../components/apple-pay-button/apple-pay-button.component';
import { GooglePayButtonComponent } from '../../components/google-pay-button/google-pay-button.component';
import { SocketService } from '../../../common/services/socket.service';
import { OrdersApiService } from '../../../shop/services/orders-api.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../../../common/services/configuration.service';

@Component({
  selector: 'app-pay',
  standalone: true, // Zakładam, że używasz standalone components
  imports: [
    ApplePayButtonComponent,
    GooglePayButtonComponent
  ],
  templateUrl: './pay.component.html',
  styleUrl: './pay.component.scss'
})
export class PayComponent implements OnInit, OnDestroy {
  system: OSType | undefined;
  
  scentId: string = '';
  deviceId: string = '';
  orderId: string = ''; // Tu zapiszemy ID zamówienia z bazy
  quantity: number = 0;
  discountCode: string | undefined;

  finalPrice: string = '';

  private socketSub: Subscription | undefined;


  constructor(
    private route: ActivatedRoute,
    private router: Router,               // Do przekierowania na ekran sukcesu
    private socketService: SocketService, // Nasz WebSocket
    private ordersApi: OrdersApiService,   // Do komunikacji z API (tworzenie zamówienia)
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.system = this.detectMobileOS();

    this.route.queryParams.subscribe(params => {
        this.scentId = params['scentId'] || '';
        this.deviceId = params['deviceId'] || '';
        this.quantity = params['quantity'] ? Number(params['quantity']) : 1; 
        this.discountCode = params['discountCode'];

        console.log('Parametry płatności:', { scentId: this.scentId, deviceId: this.deviceId, quantity: this.quantity, discountCode: this.discountCode });

        if (this.scentId && this.deviceId) {
            this.createAndListen(this.scentId, this.deviceId, this.quantity, this.discountCode);
        }
    });
  }

  payWithP24() {
    if (!this.orderId) {
      alert('Błąd: Brak numeru zamówienia');
      return;
    }
    
    const apiUrl = ConfigurationService.getApiUrl(); 
  
    this.http.post<any>(`${apiUrl}/payments/p24/start`, { orderId: this.orderId })
      .subscribe({
        next: (res) => {
          if (res.redirectUrl) {
             console.log('Przekierowanie do P24:', res.redirectUrl);
             window.location.href = res.redirectUrl;
          }
        },
        error: (err) => console.error('Błąd startu P24:', err)
      });
  }

  // Główna logika: Tworzy zamówienie -> Łączy WebSocket -> Czeka na sukces
  createAndListen(scentId: string, deviceId: string, quantity: number, discountCode?: string) {
    const payload = {
      scentId: scentId,
      deviceId: deviceId,
      quantity: Number(quantity), 
      discountCode: discountCode || undefined // 👈 Jeśli pusty string, wyślij undefined (żeby DTO nie krzyczało)
    };

    console.log('Wysyłam do backendu:', payload); // Zobacz w konsoli co leci

    this.ordersApi.createOrder({ scentId, deviceId, quantity, discountCode }).subscribe({
        next: (order: any) => {
            this.orderId = order.id;
            
            if (order.amount !== undefined && order.amount !== null) {
              this.finalPrice = Number(order.amount).toFixed(2);
          } else {
              this.finalPrice = '0.00'; // Fallback
          }

            console.log('✅ Zamówienie:', this.orderId, 'Cena końcowa:', this.finalPrice);
            this.cdr.detectChanges();

            // Jeśli 100% zniżki (cena 0), backend od razu ustawił PAID
            if (order.status === 'PAID') {
               this.router.navigate(['/payment/confirm'], { queryParams: { orderId: this.orderId } });
               return;
            }

            this.socketService.joinOrderRoom(this.orderId);
            this.socketSub = this.socketService.onOrderStatus().subscribe((data) => {
                if (data.status === 'PAID') {
                    this.router.navigate(['/payment/confirm'], { queryParams: { orderId: this.orderId } });
                }
            });
        },
        error: (err) => {
          console.error('❌ Błąd tworzenia zamówienia:', err);
          // Tutaj zobaczysz szczegóły błędu 400, jeśli nadal wystąpi
          if (err.error && err.error.message) {
              console.error('Szczegóły walidacji:', err.error.message);
          }
      }
        
    });
}

  ngOnDestroy(): void {
      // Bardzo ważne: rozłączamy się po wyjściu z ekranu, żeby nie dublować nasłuchiwania
      if (this.socketSub) this.socketSub.unsubscribe();
      this.socketService.disconnect();
  }

  detectMobileOS(): OSType {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent)) return OSType.Android;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) return OSType.iOS;
    return OSType.Other;
  }

  protected readonly OSType = OSType;
}