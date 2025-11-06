import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GooglePayService } from '../../services/google-pay.service';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
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
  ready = false;

  // ✅ pełny paymentRequest — sandbox + DIRECT (ECv2)
  paymentRequest: google.payments.api.PaymentDataRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,

    allowedPaymentMethods: [
      {
        type: 'CARD' as google.payments.api.PaymentMethodType,
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['VISA', 'MASTERCARD'],
          billingAddressRequired: false
        },
        tokenizationSpecification: {
          type: 'DIRECT',
          parameters: {
            protocolVersion: 'ECv2',
            // ⚠️ Wklej swój dokładny RSA public key z panelu Tpay (base64, bez nowej linii)
            publicKey: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS1NSUlFcFFJQkFBS0NBUUVBd0xsaUoxcU1kY1B2RGtDd1hu...'
          }
        }
      }
    ],

    merchantInfo: {
      merchantName: 'VendX Sandbox',
      merchantId: '' // sandbox = puste pole
    },

    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: '1.00',
      currencyCode: 'PLN'
    },

    callbackIntents: ['PAYMENT_AUTHORIZATION']
  };

  constructor(
    private googlePayService: GooglePayService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🔄 Google Pay init...');
    this.googlePayService
      .init()
      .pipe(switchMap(() => this.googlePayService.isReadyToPay()))
      .subscribe({
        next: (isReady) => {
          console.log('✅ Google Pay ready:', isReady);
          this.ready = isReady;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Google Pay init error:', err);
        }
      });
  }

  pay() {
    const amount = '1.00';
    const currency = 'PLN';

    this.googlePayService.requestPayment(amount).subscribe({
      next: (paymentData) => {
        console.log('✅ Payment data received:', paymentData);
        const token = paymentData.paymentMethodData.tokenizationData.token;

        // wysyłamy do backendu przez finalizePayment
        this.googlePayService.finalizePayment(token, amount, currency).subscribe({
          next: (res) => {
            if (res.success && res.redirectUrl) {
              console.log('✅ Redirect to Tpay:', res.redirectUrl);
              window.location.href = res.redirectUrl;
            } else {
              console.error('❌ Payment finalize failed:', res.error);
            }
          },
          error: (err) => {
            console.error('❌ Backend error:', err);
          }
        });
      },
      error: (err) => {
        console.error('❌ Payment request error:', err);
      }
    });
  }

  // ✅ Obsługa autoryzacji płatności
  onPaymentAuthorized: google.payments.api.PaymentAuthorizedHandler = (paymentData) => {
    console.log('✅ Payment authorized:', paymentData);

    const token = paymentData.paymentMethodData.tokenizationData.token;
    const amount = this.paymentRequest.transactionInfo.totalPrice;
    const currency = this.paymentRequest.transactionInfo.currencyCode;

    this.googlePayService.finalizePayment(token, amount, currency).subscribe({
      next: (res) => {
        if (res.success && res.redirectUrl) {
          console.log('✅ Redirect to Tpay:', res.redirectUrl);
          window.location.href = res.redirectUrl;
        } else {
          console.error('❌ Payment failed:', res.error);
        }
      },
      error: (err) => console.error('❌ Backend error:', err)
    });

    return { transactionState: 'SUCCESS' };
  };
}
