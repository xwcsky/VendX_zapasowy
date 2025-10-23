import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ConfigurationService } from '../../common/services/configuration.service';

export interface CreateOrderDto {
  scentId: string;
  deviceId: string;
}

export interface Order {
  id: string;
  scent_id: string;
  device_id: string;
  creation_date: string; // ISO string
}

@Injectable({
  providedIn: 'root'
})
export class OrdersApiService {
  private readonly API_URL = ConfigurationService.getApiUrl();

  constructor(private http: HttpClient, private authService: AuthService) { }

  createOrder(dto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(`${this.API_URL}/colognes`, dto);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/colognes`);
  }
}
