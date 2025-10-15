import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Cologne} from '../../common/model/interfaces';

export interface CreateCologneDto {
  brandName: string;
  cologneName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ColognesApiService {
  private apiUrl = 'http://localhost:3000/colognes'; // backend URL

  constructor(private http: HttpClient) {}

  // Tworzy nowe zamówienie
  createOrder(dto: CreateCologneDto): Observable<Cologne> {
    return this.http.post<Cologne>(this.apiUrl, dto);
  }

  // Pobiera listę zamówień
  getColognes(): Observable<Cologne[]> {
    return this.http.get<Cologne[]>(this.apiUrl);
  }
}
