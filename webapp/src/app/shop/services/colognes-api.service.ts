import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Cologne} from '../../common/model/interfaces';
import {AuthService} from '../../auth/auth.service';
import {ConfigurationService} from '../../common/services/configuration.service';

export interface CreateCologneDto {
  brandName: string;
  cologneName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ColognesApiService {
  private readonly API_URL = ConfigurationService.getApiUrl();

  constructor(private http: HttpClient, private authService: AuthService) {}

  getColognes(): Observable<Cologne[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Cologne[]>(`${this.API_URL}/colognes`, { headers });
  }

  validateDiscount(code: string) {
    return this.http.post<any>(`${this.API_URL}/discounts/check`, { code });
  }
}
