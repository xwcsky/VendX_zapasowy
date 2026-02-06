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
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common'; // Ważne dla *ngIf w HTML

@Component({
  selector: 'app-pay',
  standalone: true,
  imports: [
    CommonModule,
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
  orderId: string = ''; // ID zamówienia z bazy
  quantity: number = 0;
  discountCode: string | undefined;

  finalPrice: string = '0.00'; // Trzymamy jako string do wyświetlania w HTML
  isLoading: boolean = false;

  private socketSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private ordersApi: OrdersApiService,
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

        if (this.scentId && this.deviceId) {
            // Tworzymy zamówienie od razu, żeby znać cenę i mieć ID dla P24
            this.createOrderAndListen(this.scentId, this.deviceId, this.quantity, this.discountCode);
        }
    });
  }

  // 1. Tworzenie zamówienia przy wejściu na stronę
  createOrderAndListen(scentId: string, deviceId: string, quantity: number, discountCode?: string) {
    this.isLoading = true;

    this.ordersApi.createOrder({ scentId, deviceId, quantity, discountCode }).subscribe({
        next: (order: any) => {
            this.orderId = order.id;
            
            // Obsługa ceny
            if (order.amount !== undefined && order.amount !== null) {
              this.finalPrice = Number(order.amount).toFixed(2);
            } else {
              this.finalPrice = '0.00';
            }

            console.log('✅ Zamówienie:', this.orderId, 'Cena:', this.finalPrice);
            this.isLoading = false;
            this.cdr.detectChanges();

            // Jeśli cena = 0 (kod 100%), od razu sukces
            if (order.status === 'PAID') {
               this.router.navigate(['/payment/confirm'], { queryParams: { orderId: this.orderId } });
               return;
            }

            // Nasłuchujemy na zmiany statusu (jak klient wróci z P24)
            this.socketService.joinOrderRoom(this.orderId);
            this.socketSub = this.socketService.onOrderStatus().subscribe((data) => {
                if (data.status === 'PAID') {
                    this.router.navigate(['/payment/confirm'], { queryParams: { orderId: this.orderId } });
                }
            });
        },
        error: (err) => {
          console.error('❌ Błąd tworzenia zamówienia:', err);
          this.isLoading = false;
        }
    });
  }

  // 2. Inicjacja płatności P24 (podpięta pod wszystkie przyciski)
  async initiateP24Payment(method: 'blik' | 'gpay' | 'apple') {
    if (!this.orderId) {
      console.error('Brak ID zamówienia! Czekam na API...');
      return;
    }

    this.isLoading = true;
    console.log(`Rozpoczynam płatność P24 (${method}) dla zamówienia:`, this.orderId);

    try {
      // Obliczamy kwotę w groszach z stringa
      const amountInGrosze = Math.round(Number(this.finalPrice) * 100);

      // Rejestrujemy w P24
      const p24Response = await this.http.post<any>(`${environment.apiUrl}/payments/init`, {
        orderId: this.orderId,
        email: 'klient@vendx.pl',
        amount: amountInGrosze
      }).toPromise();

      console.log('Odpowiedź P24:', p24Response);

      // Przekierowanie
      if (p24Response && p24Response.token) {
        window.location.href = `https://sandbox.przelewy24.pl/trnRequest/${p24Response.token}`;
      } else {
        throw new Error('Brak tokenu P24');
      }

    } catch (error) {
      console.error('Błąd płatności:', error);
      this.isLoading = false;
      this.router.navigate(['/error']); // Możesz też pokazać alert zamiast wychodzić
    }
  }

  // Wrappery dla przycisków w HTML
  onGooglePay() { this.initiateP24Payment('gpay'); }
  onApplePay()  { this.initiateP24Payment('apple'); }
  
  // Jeśli masz osobny przycisk "Zapłać BLIK" w HTML
  payWithP24()  { this.initiateP24Payment('blik'); }

  ngOnDestroy(): void {
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