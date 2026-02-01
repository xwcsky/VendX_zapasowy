import { Component } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import {ApplePayButtonComponent} from '../../components/apple-pay-button/apple-pay-button.component';
import {GooglePayButtonComponent} from '../../components/google-pay-button/google-pay-button.component';
import {OSType} from '../../../common/model/enums';

@Component({
  selector: 'app-confirm.component',
  imports: [],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent {

  protected readonly OSType = OSType;
  orderId: string = '';
  secondsLeft: number = 10; // Czas wyświetlania komunikatu

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Pobieramy ID zamówienia (opcjonalnie, np. żeby wyświetlić numer)
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'];
    });

    // Odliczanie i powrót
    const interval = setInterval(() => {
      this.secondsLeft--;
      if (this.secondsLeft <= 0) {
        clearInterval(interval);
        this.router.navigate(['/shop']); // Wracamy do wygaszacza
      }
    }, 1000);
  }
}
