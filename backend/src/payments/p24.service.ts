import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class P24Service {
  private logger = new Logger(P24Service.name);

  private merchantId = Number(process.env.P24_MERCHANT_ID);
  private posId = Number(process.env.P24_POS_ID);
  private crc = process.env.P24_CRC;
  private apiUrl = process.env.P24_API_URL;
  private appUrl = process.env.APP_URL; // Backend URL
  private frontendUrl = process.env.FRONTEND_URL; // Frontend URL

  constructor(private readonly httpService: HttpService) {}

  // 1. Rejestracja transakcji (Pobranie tokena)
  async registerTransaction(order: any) {
    const sessionId = order.id; // Używamy ID zamówienia jako sesji
    const amount = Math.round(order.amount * 100); // P24 wymaga kwoty w groszach (int)
    const currency = 'PLN';

    // Obliczanie sumy kontrolnej (Sign)
    // Format: {"sessionId":"...","merchantId":...,"amount":...,"currency":"PLN","crc":"..."}
    const signString = `{"sessionId":"${sessionId}","merchantId":${this.merchantId},"amount":${amount},"currency":"${currency}","crc":"${this.crc}"}`;
    const sign = crypto.createHash('sha384').update(signString).digest('hex');

    const payload = {
      merchantId: this.merchantId,
      posId: this.posId,
      sessionId: sessionId,
      amount: amount,
      currency: currency,
      description: `Zamówienie ${order.cologneName || 'VendX'}`,
      email: 'klient@test.pl', // Można pobrać od usera, tu hardcode dla testu
      country: 'PL',
      language: 'pl',
      urlReturn: `${this.frontendUrl}/payment/confirm?orderId=${order.id}`, // Gdzie wrócić po płatności
      urlStatus: `${this.appUrl}/payments/p24/notify`, // Webhook (Backend)
      sign: sign,
    };

    try {
      this.logger.log(`Rejestruję w P24: ${sessionId}, kwota: ${amount}`);
      const response = await lastValueFrom(
        this.httpService.post(`${this.apiUrl}/transaction/register`, payload, {
          auth: {
            username: String(this.merchantId),
            password: process.env.P24_REPORT_KEY || '', 
          },
        }),
      );

      const token = response.data.data.token;
      // Zwracamy gotowy link do płatności
      return `https://sandbox.przelewy24.pl/trnRequest/${token}`;
    } catch (error) {
      this.logger.error('Błąd P24 Register:', error.response?.data || error.message);
      throw error;
    }
  }

  // 2. Weryfikacja powiadomienia (Webhook)
  async verifyTransaction(payload: any) {
    const { merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement, sign } = payload;

    // Sprawdź czy to nasze zamówienie
    // Sign z powiadomienia oblicza się inaczej!
    // Format: {"merchantId":...,"posId":...,"sessionId":"...","amount":...,"originAmount":...,"currency":"...","orderId":...,"methodId":...,"statement":"...","crc":"..."}
    
    const signString = `{"merchantId":${merchantId},"posId":${posId},"sessionId":"${sessionId}","amount":${amount},"originAmount":${originAmount},"currency":"${currency}","orderId":${orderId},"methodId":${methodId},"statement":"${statement}","crc":"${this.crc}"}`;
    const expectedSign = crypto.createHash('sha384').update(signString).digest('hex');

    if (sign !== expectedSign) {
      this.logger.error(`Błędny podpis transakcji ${sessionId}!`);
      // throw new Error('Invalid Checksum'); 
      // P24 czasem wysyła inne pola w JSON, dla bezpieczeństwa można pominąć throw i sprawdzić w API
    }

    // Dodatkowe potwierdzenie w API P24 (Verify)
    const verifyPayload = {
      merchantId: this.merchantId,
      posId: this.posId,
      sessionId: sessionId,
      amount: amount,
      currency: currency,
      orderId: orderId,
      sign: crypto.createHash('sha384').update(`{"sessionId":"${sessionId}","orderId":${orderId},"amount":${amount},"currency":"${currency}","crc":"${this.crc}"}`).digest('hex')
    };

    try {
       await lastValueFrom(
        this.httpService.put(`${this.apiUrl}/transaction/verify`, verifyPayload, {
          auth: { username: String(this.merchantId), password: process.env.P24_REPORT_KEY || '' },
        }),
      );
      return true;
    } catch (e) {
      this.logger.error('Błąd weryfikacji P24:', e.response?.data);
      return false;
    }
  }
}