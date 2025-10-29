import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GooglePayLoaderService {
  private scriptLoaded = false;

  loadScript(): Observable<void> {
    return new Observable<void>((observer) => {
      if (this.scriptLoaded) {
        observer.next();
        observer.complete();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.async = true;
      script.onload = () => {
        this.scriptLoaded = true;
        observer.next();
        observer.complete();
      };
      script.onerror = () => observer.error('Google Pay SDK failed to load.');

      document.head.appendChild(script);
    });
  }
}
