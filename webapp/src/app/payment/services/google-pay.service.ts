import { Injectable } from '@angular/core';
import { GooglePayLoaderService } from './google-pay-loader.service';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GooglePayService {

  private paymentsClient: any;
  constructor(private loader: GooglePayLoaderService) {}

  init(): Observable<void> {
    return this.loader.loadScript().pipe(
      map(() => {
        this.paymentsClient = new (window as any).google.payments.api.PaymentsClient({ environment: 'TEST' });
      })
    );
  }

  isReadyToPay(): Observable<boolean> {
    const request = {
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['VISA', 'MASTERCARD']
        }
      }]
    };

    return from(
      this.paymentsClient.isReadyToPay(request) as Promise<{ result: boolean }>
    ).pipe(
      map(response => response.result)
    );
  }

  getPaymentDataRequest(price: string) {
    return {
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
            type: 'DIRECT',
            parameters: {
              protocolVersion: 'ECv2',
              publicKey: 'TU_TUTAJ_PUBLICZNY_KLUCZ_SANDBOX'
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
        totalPrice: price,
        currencyCode: 'PLN'
      }
    };
  }

  requestPayment(price: string): Observable<any> {
    const paymentDataRequest = this.getPaymentDataRequest(price);
    return from(
      this.paymentsClient.loadPaymentData(paymentDataRequest) as Promise<any>
    );
  }
}
