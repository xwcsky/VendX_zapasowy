import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ConfigurationService } from '../../common/services/configuration.service';

export interface CreateOrderDto {
  scentId: string;
  deviceId: string;
  quantity: number;
}

export interface Order {
  id: string;
  scent_id: string;
  status?: string;
  quantity?: number;
  amount?: number;
  creation_date?: string;
  scentId?: string;
  deviceId?: string;
  creationDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersApiService {
  private readonly API_URL = ConfigurationService.getApiUrl();

  constructor(private http: HttpClient, private authService: AuthService) { }

  createOrder(data: { scentId: string, deviceId: string, quantity: number }) {
    return this.http.post<any>(`${this.API_URL}/orders`, data);
}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/orders`);
  }
}
