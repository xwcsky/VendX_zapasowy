import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { AuthService } from './auth.service';
import { first, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // czekamy na token, zanim wyślemy request
    return this.authService.token$.pipe(
      first(), // pobiera aktualną wartość i kończy obserwację
      switchMap(token => {
        const clonedReq = token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;
        return next.handle(clonedReq);
      })
    );
  }
}
