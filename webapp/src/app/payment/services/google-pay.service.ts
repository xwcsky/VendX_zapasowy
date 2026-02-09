import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigurationService } from '../../common/services/configuration.service';
import { environment } from '../../../environments/environment';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class GooglePayService {
  private paymentsClient!: any;
  private environment: 'TEST' | 'PRODUCTION' = 'TEST';
  private readonly gatewayMerchantId = environment.p24MerchantId || '370550';

  private readonly API_URL = ConfigurationService.getApiUrl();

  constructor(private http: HttpClient) {}

  /**
   * Initialize PaymentsClient (must be called before isReadyToPay / loadPaymentData)
   */
  init(): Observable<boolean> {
    try {
      if (!this.paymentsClient) {
        // Sprawdzamy czy skrypt w ogóle jest
        if (typeof google === 'undefined' || !google.payments) {
            console.error('Google Pay SDK nie załadowane!');
            return of(false);
        }

        this.paymentsClient = new google.payments.api.PaymentsClient({
          environment: this.environment
        });
        console.log('GooglePayService: PaymentsClient created', this.paymentsClient);
      }
      return of(true);
    } catch (err) {
      console.error('GooglePayService.init() error', err);
      return of(false);
    }
  }

  /**
   * isReadyToPay wrapper — MUST include allowedPaymentMethods
   * Returns Observable<boolean>
   */
  isReadyToPay(): Observable<boolean> {
    const request = {
      apiVersion: 2,
      apiVersionMinor: 0,
      // IMPORTANT: allowedPaymentMethods must exist; use CARD for web sandbox isReadyToPay
      allowedPaymentMethods: [
        {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['VISA', 'MASTERCARD']
          }
        }
      ]
    };

    if (!this.paymentsClient) {
      console.warn('GooglePayService.isReadyToPay() called before init()');
      return of(false);
    }

    // paymentsClient.isReadyToPay returns a Promise
    return from(this.paymentsClient.isReadyToPay(request)).pipe(
      map((res: any) => {
        console.log('GooglePayService.isReadyToPay response:', res);
        return !!res && !!res.result;
      }),
      catchError((err) => {
        console.error('GooglePayService.isReadyToPay ERROR:', err);
        throw err;
      })
    );
  }

  /**
   * Create full PaymentDataRequest used by the <google-pay-button> (DIRECT tokenization)
   * You can call this from component or leave the component's own paymentRequest.
   */
  createPaymentRequest(totalPrice = '1.00', currency = 'PLN') {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['VISA', 'MASTERCARD'],
            billingAddressRequired: false
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY', //Tylko dla testu
            parameters: {
              'gateway': 'przelewy24',
              'gatewayMerchantId': this.gatewayMerchantId
              // protocolVersion: 'ECv2',
              // publicKey: publicKeyPem // must be PEM string with BEGIN/END
            }
          }
        }
      ],
      merchantInfo: {
        merchantName: 'Funcluster Daniel Jurkowski',
        merchantId: this.gatewayMerchantId // Testowe ID akceptowane przez Sandbox
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: totalPrice,
        currencyCode: currency
      },
      callbackIntents: ['PAYMENT_AUTHORIZATION']
    } as google.payments.api.PaymentDataRequest;
  }

  /**
   * finalizePayment: send Google Pay token + amount to your backend (/payments)
   * returns Observable of backend response
   */
  finalizePayment(token: string, amount: string, scentId: string, deviceId: string, currency: string): Observable<any> {
    const body = { token, amount, scentId, deviceId, currency };
    console.log('GooglePayService.finalizePayment ->', body);
    return this.http.post(`${this.API_URL}/payments`, body).pipe(
      map((res) => {
        console.log('GooglePayService.finalizePayment response:', res);
        return res;
      }),
      catchError((err) => {
        console.error('GooglePayService.finalizePayment ERROR:', err);
        throw err;
      })
    );
  }
}
