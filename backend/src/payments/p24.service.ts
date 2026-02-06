// backend/src/payments/p24.service.ts

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class P24Service {
  private logger = new Logger(P24Service.name);
  
  // Dane z pliku .env
  private merchantId = Number(process.env.P24_MERCHANT_ID);
  private posId = Number(process.env.P24_POS_ID);
  private crc = process.env.P24_CRC; // Klucz CRC (do podpisów)
  private reportKey = process.env.P24_REPORT_KEY; // Klucz API
  private sandbox = true; // Zmień na false jak wyjdziesz z testów!
  
  private get baseUrl() {
    return this.sandbox 
      ? 'https://sandbox.przelewy24.pl/api/v1' 
      : 'https://secure.przelewy24.pl/api/v1';
  }

  // 1. REJESTRACJA TRANSAKCJI (To już pewnie masz, ale upewnij się co do adresu powrotu)
  async registerTransaction(amount: number, sessionId: string, email: string) {
    const signString = `{"sessionId":"${sessionId}","merchantId":${this.merchantId},"amount":${amount},"currency":"PLN","crc":"${this.crc}"}`;
    const sign = crypto.createHash('sha384').update(signString).digest('hex');

    const returnUrl = 'https://vendx.pl/confirm'; // Gdzie wraca klient
    const statusUrl = `${process.env.APP_URL || 'https://seal-app-u9fd7.ondigitalocean.app'}/payments/p24/notification`;

    const payload = {
      merchantId: this.merchantId,
      posId: this.posId,
      sessionId: sessionId,
      amount: amount,
      currency: 'PLN',
      description: 'Zamowienie VendX',
      email: email,
      country: 'PL',
      language: 'pl',
      // 👇 Ważne: Gdzie wysłać klienta po płatności?
      urlReturn: returnUrl, 
      // 👇 Ważne: Gdzie P24 ma wysłać tajne potwierdzenie do bazy?
      urlStatus: statusUrl,
      sign: sign,
    };

    try {
      // Używamy Basic Auth z posId i kluczem API (Report Key)
      const auth = Buffer.from(`${this.posId}:${this.reportKey}`).toString('base64');
      
      const response = await axios.post(`${this.baseUrl}/transaction/register`, payload, {
        headers: { Authorization: `Basic ${auth}` }
      });
      return response.data.data.token; // Zwracamy token transakcji
    } catch (e) {
      this.logger.error('Błąd rejestracji P24', e.response?.data || e.message);
      throw e;
    }
  }

  // 2. WERYFIKACJA (To, czego brakowało)
  async verifyTransaction(payload: any) {
    const { sessionId, amount, originAmount, currency, orderId, methodId, statement, sign } = payload;

    // A. Obliczamy własny podpis, żeby sprawdzić czy nikt nie oszukuje
    const signString = `{"sessionId":"${sessionId}","orderId":${orderId},"amount":${amount},"currency":"${currency}","crc":"${this.crc}"}`;
    const mySign = crypto.createHash('sha384').update(signString).digest('hex');

    if (mySign !== sign) {
      this.logger.error(`Błędny podpis transakcji! Oczekiwano: ${mySign}, otrzymano: ${sign}`);
      throw new Error('Invalid signature');
    }

    // B. Wysyłamy potwierdzenie do P24 (PUT)
    const verifyPayload = {
      merchantId: this.merchantId,
      posId: this.posId,
      sessionId: sessionId,
      amount: amount,
      currency: currency,
      orderId: orderId,
      sign: mySign // Tu używamy wyliczonego podpisu
    };

    const auth = Buffer.from(`${this.posId}:${this.reportKey}`).toString('base64');

    try {
      await axios.put(`${this.baseUrl}/transaction/verify`, verifyPayload, {
        headers: { Authorization: `Basic ${auth}` }
      });
      this.logger.log(`Transakcja ${sessionId} zweryfikowana pomyślnie.`);
      return true;
    } catch (e) {
      this.logger.error('Błąd weryfikacji P24', e.response?.data || e.message);
      throw e;
    }
  }
}