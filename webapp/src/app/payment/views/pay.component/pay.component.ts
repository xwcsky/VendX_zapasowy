import {Component, OnInit} from '@angular/core';
import {OSType} from '../../../common/model/enums';
import {ApplePayButtonComponent} from '../../components/apple-pay-button/apple-pay-button.component';
import {GooglePayButtonComponent} from '../../components/google-pay-button/google-pay-button.component';

@Component({
  selector: 'app-pay.component',
  imports: [
    ApplePayButtonComponent,
    GooglePayButtonComponent
  ],
  templateUrl: './pay.component.html',
  styleUrl: './pay.component.scss'
})
export class PayComponent implements OnInit{
  system: OSType | undefined;

  constructor() {}

  ngOnInit(): void {
      this.system = this.detectMobileOS();
  }

  detectMobileOS(): OSType {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/android/i.test(userAgent)) {
      return OSType.Android;
    }

    // iOS detection: iPhone, iPad, iPod
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return OSType.iOS;
    }

    return OSType.Other
  }

  protected readonly OSType = OSType;
}
