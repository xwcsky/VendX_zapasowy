import { Injectable } from '@angular/core';
import { GooglePayLoaderService } from './google-pay-loader.service';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {ConfigurationService} from '../../common/services/configuration.service';
import {Cologne} from '../../common/model/interfaces';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GooglePayService {

  private readonly API_URL = ConfigurationService.getApiUrl();
  private paymentsClient: any;
  constructor(private authService: AuthService,
              private loader: GooglePayLoaderService,
              private http: HttpClient) {}

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
              publicKey: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0NCk1JR2ZNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0R05BRENCaVFLQmdRRE5FUFRjejlRZHJHT0VZVjN1SkJoKzBWa3UNCnVnY3FIRXdQWXhmc3F2T2Mwa1NRUU1ZeUdFSHZma1krWkUvZU9jcUNrczN4ZjNWRTBXbGxOKzhhSlJxSFhVdE4NClQ2alZ5M1hqajVrQzE0bGRsSWQzQ1N6dXhscGpDakQzR0dyeTg4ckZrc0RVMFRYTXlMTUI0dlJXTTZhV0hsd24NCnU4NXpwVDZvdGxnU05YZ0J6UUlEQVFBQg0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t'
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

  finalizePayment(paymentToken: string, amount: string, currency: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.API_URL}/payments`, { paymentToken, amount, currency })
  }
}
