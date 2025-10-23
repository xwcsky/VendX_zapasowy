import {Component, OnInit} from '@angular/core';

declare const google: any;

@Component({
  selector: 'app-google-pay-button',
  imports: [],
  templateUrl: './google-pay-button.component.html',
  styleUrl: './google-pay-button.component.scss'
})
export class GooglePayButtonComponent implements OnInit {
  ngOnInit() {
    const googlePay = (window as any).google;
    if (!googlePay?.payments?.api) {
      console.error('Google Pay JS not loaded');
      return;
    }

    const paymentsClient = new google.payments.api.PaymentsClient({ environment: 'TEST' });

    // Base card
    const baseCardPaymentMethod = {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['VISA', 'MASTERCARD']
      }
    };

    // DIRECT tokenization (example)
    const directTokenizationSpecification = {
      type: 'DIRECT',
      parameters: {
        protocolVersion: 'ECv2', // recommended protocol
        // publicKey is base64-encoded public key you generated and registered with Google
        publicKey: 'BAscExampleBase64PublicKeyHere...'
      }
    };

    const cardPaymentMethod = Object.assign(
      { tokenizationSpecification: directTokenizationSpecification },
      baseCardPaymentMethod
    );

    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [cardPaymentMethod],
      merchantInfo: {
        merchantId: '12345678901234567890', // Twój Google merchantId (produkcyjny)
        merchantName: 'VendX (TEST)'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: '1.00',
        currencyCode: 'PLN',
        countryCode: 'PL'
      }
    };

    paymentsClient.isReadyToPay({ allowedPaymentMethods: [baseCardPaymentMethod] })
      .then((resp: any) => {
        if (resp.result) {
          const button = paymentsClient.createButton({
            onClick: () => this.onClick(paymentsClient, paymentDataRequest)
          });
          document.getElementById('google-pay-container')?.appendChild(button);
        }
      })
      .catch((e: any) => console.error(e));
  }

  onClick(paymentsClient: any, paymentDataRequest: any) {
    paymentsClient.loadPaymentData(paymentDataRequest)
      .then((paymentData: any) => {
        // paymentData contains the encrypted token (paymentMethodData.tokenizationData)
        console.log('paymentData', paymentData);

        // Wyślij paymentData.paymentMethodData.tokenizationData (encrypted token)
        // do Twojego backendu do odszyfrowania / przetworzenia.
        fetch('/api/payments/googlepay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentData })
        })
          .then(r => r.json())
          .then(res => console.log('backend result', res))
          .catch(err => console.error(err));
      })
      .catch((err: any) => console.error('loadPaymentData error', err));
  }
}
