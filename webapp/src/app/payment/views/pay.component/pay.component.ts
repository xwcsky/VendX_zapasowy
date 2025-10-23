import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-pay.component',
  imports: [],
  templateUrl: './pay.component.html',
  styleUrl: './pay.component.scss'
})
export class PayComponent implements OnInit{
  system: 'iOS' | 'Android' | 'Other' = 'Other';

  constructor() {}

  ngOnInit(): void {
      this.system = this.detectMobileOS();
  }

  detectMobileOS(): 'iOS' | 'Android' | 'Other' {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/android/i.test(userAgent)) {
      return 'Android';
    }

    // iOS detection: iPhone, iPad, iPod
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return 'iOS';
    }

    return 'Other';
  }
}
