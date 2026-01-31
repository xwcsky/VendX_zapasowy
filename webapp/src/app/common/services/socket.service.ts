import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // Łączymy się z backendem (adres z environment lub na sztywno localhost:8080)
    // Jeśli w environment.ts masz apiUrl, użyj go. Jeśli nie, wpisz adres ręcznie.
    const url = 'http://127.0.0.1:8080'; 
    this.socket = io(url);
  }

  // Metoda do dołączenia do pokoju zamówienia (nasłuchiwanie konkretnej transakcji)
  joinOrderRoom(orderId: string) {
    this.socket.emit('joinOrderRoom', { orderId });
    console.log(`📡 Dołączono do nasłuchiwania zamówienia: ${orderId}`);
  }

  // Metoda zwracająca strumień danych (Observable), gdy status się zmieni
  onOrderStatus(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('orderStatus', (data) => {
        console.log('⚡ Otrzymano zmianę statusu:', data);
        observer.next(data);
      });
    });
  }

  // Rozłączenie (np. przy wyjściu z komponentu)
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}