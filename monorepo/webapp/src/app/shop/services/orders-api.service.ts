import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO do wysyłania
export interface CreateOrderDto {
  scentId: string;
  deviceId: string;
}

// Model zwracany z backendu
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
  private apiUrl = 'http://localhost:3000/orders'; // backend URL

  constructor(private http: HttpClient) {}

  // Tworzy nowe zamówienie
  createOrder(dto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, dto);
  }

  // Pobiera listę zamówień
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }
}
