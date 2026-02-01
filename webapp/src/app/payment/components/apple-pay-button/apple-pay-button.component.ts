import { Component ,Input} from '@angular/core';

@Component({
  selector: 'app-apple-pay-button',
  standalone: true,
  imports: [],
  templateUrl: './apple-pay-button.component.html',
  styleUrl: './apple-pay-button.component.scss'
})
export class ApplePayButtonComponent {

  @Input() scentId!: string;
  @Input() deviceId!: string;
  @Input() quantity: number = 1;
}
