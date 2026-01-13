import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScreensaverService {
  private idleTime = 0;
  private timeoutSeconds = 2; // czas bezczynności w sekundach
  private interval: any;

  public screensaverActive$ = new BehaviorSubject<boolean>(false);

  constructor(private ngZone: NgZone) {
    this.startTracking();
  }

  private startTracking() {
    this.ngZone.runOutsideAngular(() => {
      ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event =>
        window.addEventListener(event, () => this.resetIdleTime())
      );

      this.interval = setInterval(() => {
        this.idleTime++;
        console.log('Idle time:', this.idleTime);
        if (this.idleTime >= this.timeoutSeconds && !this.screensaverActive$.value) {
          console.log('Activating screensaver');
          this.ngZone.run(() => this.screensaverActive$.next(true));
        }
      }, 1000);
      
    });
  }

  private resetIdleTime() {
    this.idleTime = 0;
    console.log('Reset idle timer');
    if (this.screensaverActive$.value) {
      this.screensaverActive$.next(false);
    }
  }
  
}
