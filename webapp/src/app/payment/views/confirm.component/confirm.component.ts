import { Component } from '@angular/core';
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
}
