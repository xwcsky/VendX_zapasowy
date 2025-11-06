import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { GooglePayService } from '../../services/google-pay.service';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {GooglePayButtonModule} from '@google-pay/button-angular';

declare const google: any;

@Component({
  selector: 'app-google-pay-button',
  imports: [
    GooglePayButtonModule
  ],
  templateUrl: './google-pay-button.component.html',
  styleUrl: './google-pay-button.component.scss'
})
export class GooglePayButtonComponent implements OnInit {
  ready = false;

  paymentRequest: any = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['VISA', 'MASTERCARD']
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'tpay',
            gatewayMerchantId: '408446' // lub Twój testowy identyfikator z panelu Tpay
          }
        }
      }
    ],
    merchantInfo: {
      merchantId: '408446', // testowy Merchant ID
      merchantName: 'Demo Merchant'
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: '1',
      currencyCode: 'PLN'
    },
    callbackIntents: ['PAYMENT_AUTHORIZATION']
  };

  constructor(private googlePayService: GooglePayService, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    console.log('init');
    this.googlePayService.init().pipe(
      switchMap(() => this.googlePayService.isReadyToPay())
    ).subscribe({
      next: r => {
        console.log('lol: ', r);
        this.ready = r;
        this.cdr.detectChanges();
      },
      error: err => {
        console.log('errorrrrrr');
        console.error(err)
      }
    });
  }

  pay() {
    const amount = '1.00'; // zdefiniowane raz
    const currency = 'PLN';

    this.googlePayService.requestPayment(amount).subscribe(paymentData => {
      const token = paymentData.paymentMethodData.tokenizationData.token;

      // wysyłamy kwotę i token do backendu
      this.http.post('/payments', { token, amount, currency })
        .subscribe(response => {
          console.log('Payment processed:', response);
        });
    });
  }

  onPaymentAuthorized: google.payments.api.PaymentAuthorizedHandler = (paymentData) => {
    console.log('✅ Payment authorized:', paymentData);

    // token z Google Pay
    const token = paymentData.paymentMethodData.tokenizationData.token;

    // cena i waluta z paymentRequest
    const amount = this.paymentRequest.transactionInfo.totalPrice;
    const currency = this.paymentRequest.transactionInfo.currencyCode;

    // wyślij token + dane do backendu
    this.http.post<{ success: boolean; redirectUrl?: string; error?: string }>(
      '/payments',
      { token, amount, currency }
    ).subscribe({
      next: res => {
        if (res.success && res.redirectUrl) {
          console.log('✅ Backend OK, redirect:', res.redirectUrl);

          // ✅ PRZEKIEROWANIE DO TPAY
          window.location.href = res.redirectUrl;
        } else {
          console.error('❌ Payment failed:', res.error);
        }
      },
      error: err => console.error('❌ Backend error:', err)
    });

    // ✅ odpowiedź dla Google Pay – to MUSI być natychmiast
    return { transactionState: 'SUCCESS' };
  };

}
