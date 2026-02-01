import { ChangeDetectorRef, Component, OnInit, Input } from '@angular/core';
import { GooglePayService } from '../../services/google-pay.service';
import { switchMap } from 'rxjs/operators';
import { GooglePayButtonModule } from '@google-pay/button-angular';

declare const google: any;

@Component({
  selector: 'app-google-pay-button',
  standalone: true,
  imports: [GooglePayButtonModule],
  templateUrl: './google-pay-button.component.html',
  styleUrls: ['./google-pay-button.component.scss']
})
export class GooglePayButtonComponent implements OnInit {
  @Input() scentId!: string;
  @Input() deviceId!: string;
  @Input() quantity: number = 1;
  ready = false;
  paymentRequest!: google.payments.api.PaymentDataRequest;

  private readonly UNIT_PRICE = 5.00;

  constructor(
    private googlePayService: GooglePayService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // 🔒 Twój publiczny klucz RSA (DIRECT z Tpay Sandbox)
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDNEPTcj9QdrGOEYV3uJBh+0Vku
ugnqHEwPYxfsqvOc0kSQQMYyGEHvfkY+ZE/eOcqKks3xf3VE0WllN+8aJRqHXUtN
T6jVy3Xjj5kC14ldlId3CSzuxlpjCjD3GGry88rFksDU0TXMyLMB4vRWM6aWHlwn
u85zpT6otlgSNXgBzQIDAQAB
-----END PUBLIC KEY-----`;

    const totalPriceStr = (this.UNIT_PRICE * this.quantity).toFixed(2);

    // 🧠 Inicjalizacja SDK Google Pay i sprawdzenie dostępności
    this.googlePayService
      .init()
      .pipe(switchMap(() => this.googlePayService.isReadyToPay()))
      .subscribe({
        next: (isReady) => {
          if (isReady) {
            this.paymentRequest = this.googlePayService.createPaymentRequest(
              publicKeyPem,
              totalPriceStr,
              'PLN'
            );
            this.ready = true;
            console.log('✅ Google Pay ready, paymentRequest:', this.paymentRequest);
          } else {
            console.error('❌ Google Pay not available');
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('❌ Google Pay init error:', err)
      });
  }

  // 🔥 Callback po autoryzacji płatności
  onPaymentAuthorized: google.payments.api.PaymentAuthorizedHandler = (
    paymentData: google.payments.api.PaymentData
  ) => {
    console.log('✅ Payment authorized:', paymentData);

    const token = paymentData.paymentMethodData.tokenizationData.token;
    const amount = this.paymentRequest.transactionInfo.totalPrice;
    const currency = this.paymentRequest.transactionInfo.currencyCode;

    this.googlePayService.finalizePayment(token, amount,this.scentId, this.deviceId, currency).subscribe({
      next: (res: any) => {
        if (res.success && res.redirectUrl) {
          console.log('✅ Backend OK, redirect:', res.redirectUrl);
          window.location.href = res.redirectUrl;
        } else {
          console.error('❌ Payment failed:', res.error);
          alert('❌ Payment failed: ' + (res.error || 'unknown error'));
        }
      },
      error: (err) => {
        console.error('❌ Backend error:', err);
        alert('❌ Backend error: ' + err.message);
      }
    });

    // ✅ Odpowiedź dla Google Pay (musi być natychmiast)
    return { transactionState: 'SUCCESS' };
  };
}
