import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-screensaver',
  standalone: true,
  imports: [CommonModule],
  template: `<div style="position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); color:white; display:flex; justify-content:center; align-items:center; font-size:2rem;" *ngIf="active">
               Screensaver Active
             </div>`
})
export class ScreensaverComponent {
  active = true;
  constructor() { console.log('ScreensaverComponent instantiated'); }
}
