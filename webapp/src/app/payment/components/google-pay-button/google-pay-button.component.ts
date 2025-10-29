import { Component, OnInit } from '@angular/core';
import { GooglePayService } from '../../services/google-pay.service';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import {HttpClient} from '@angular/common/http';

declare const google: any;

@Component({
  selector: 'app-google-pay-button',
  imports: [],
  templateUrl: './google-pay-button.component.html',
  styleUrl: './google-pay-button.component.scss'
})
export class GooglePayButtonComponent implements OnInit {
  ready = false;

  constructor(private googlePayService: GooglePayService, private http: HttpClient) {}

  ngOnInit() {
    this.googlePayService.init().pipe(
      switchMap(() => this.googlePayService.isReadyToPay())
    ).subscribe({
      next: r => this.ready = r,
      error: err => console.error(err)
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
}
