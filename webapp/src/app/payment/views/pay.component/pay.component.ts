import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OSType } from '../../../common/model/enums';
import { ApplePayButtonComponent } from '../../components/apple-pay-button/apple-pay-button.component';
import { GooglePayButtonComponent } from '../../components/google-pay-button/google-pay-button.component';
// Importujemy serwisy (upewnij się, że ścieżki są poprawne w Twoim projekcie)
import { SocketService } from '../../../common/services/socket.service';
import { OrdersApiService } from '../../../shop/services/orders-api.service';
import { Subscription } from 'rxjs';

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
    private ordersApi: OrdersApiService   // Do komunikacji z API (tworzenie zamówienia)
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

  // Główna logika: Tworzy zamówienie -> Łączy WebSocket -> Czeka na sukces
  createAndListen(scentId: string, deviceId: string, quantity: number, discountCode?: string) {
    // 👇 Wysyłamy discountCode do backendu
    this.ordersApi.createOrder({ scentId, deviceId, quantity, discountCode }).subscribe({
        next: (order: any) => {
            this.orderId = order.id;
            
            // 👇 ODBIERAMY CENĘ Z BAZY DANYCH
            // Backend policzył rabat i zwraca gotową kwotę w 'order.amount'
            this.finalPrice = Number(order.amount).toFixed(2); 

            console.log('✅ Zamówienie:', this.orderId, 'Cena końcowa:', this.finalPrice);

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
        error: (err) => console.error('❌ Błąd tworzenia zamówienia:', err)
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