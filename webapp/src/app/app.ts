import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { GooglePayButtonModule } from '@google-pay/button-angular';
import { ScreensaverService } from './screensaver';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, GooglePayButtonModule],
  template: `<router-outlet></router-outlet>`,
})
export class App {
  constructor(private screensaverService: ScreensaverService){
    
  }
}
