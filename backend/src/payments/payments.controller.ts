import { Controller, Post, Body, HttpCode, BadRequestException, NotFoundException, Logger} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { P24Service } from './p24.service';

@Controller('payments')
export class PaymentsController {
  private logger = new Logger('PaymentsController');
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
    private readonly p24Service: P24Service
  ) {}

  @Post('p24/start')
  async startP24Payment(@Body() body: { orderId: string }) {
    console.log('[P24] Start płatności dla:', body.orderId);
    
    // Pobierz dane zamówienia
    const allOrders = await this.ordersService.findAll();
    const order = allOrders.find(o => o.id === body.orderId);

    if (!order) throw new NotFoundException('Nie znaleziono zamówienia');

    // PRZYGOTOWANIE DANYCH DLA P24
    // 1. Kwota w groszach (P24 nie obsługuje przecinków)
    const amountInGrosze = Math.round(Number(order.amount) * 100);
    
    // 2. Email (jeśli kiosk nie ma usera, dajemy techniczny)
    const email = 'klient@vendx.pl'; 

    // 3. Wywołanie serwisu z 3 argumentami (Tak jak wymaga p24.service.ts)
    const token = await this.p24Service.registerTransaction(
      amountInGrosze, 
      order.id, 
      email
    );

    // 4. Zwracamy gotowy link do przekierowania
    return { 
      redirectUrl: `https://sandbox.przelewy24.pl/trnRequest/${token}` 
    };
  }

  @Post('p24/notification')
  @HttpCode(200) // P24 wymaga odpowiedzi 200 OK
  async handleNotification(@Body() body: any) {
    this.logger.log('Otrzymano powiadomienie z P24:', body);

    try {
      // 1. Weryfikujemy czy to P24, a nie haker
      await this.p24Service.verifyTransaction(body);

      // 2. Jeśli weryfikacja przeszła -> Aktualizujemy bazę
      // body.sessionId to ID zamówienia z naszej bazy (zazwyczaj)
      await this.paymentsService.markAsPaid(body.sessionId);
      
      return 'OK';
    } catch (error) {
      this.logger.error('Błąd przetwarzania powiadomienia', error);
      // Nie rzucamy 500, bo P24 będzie ponawiał. Logujemy błąd.
      throw error; 
    }
  }
  
  @Post()
  async handleGooglePay(@Body() body: any) {
    console.log('[GooglePay] Otrzymano token:', body);

    const allOrders = await this.ordersService.findAll();
    
    // Szukamy ostatniego zamówienia PENDING dla tego urządzenia
    const pendingOrder = allOrders.find(o => 
      o.deviceId === body.deviceId && 
      o.status === 'PENDING'
    );

    if (!pendingOrder) {
      console.error('Nie znaleziono oczekującego zamówienia dla urządzenia:', body.deviceId);
      throw new NotFoundException('Brak oczekującego zamówienia do opłacenia');
    }

    console.log(`[GooglePay] Zatwierdzam zamówienie: ${pendingOrder.id}`);
    
    // Potwierdzamy płatność
    return this.ordersService.confirmPayment(pendingOrder.id, 'GOOGLE_PAY_DEMO_TOKEN', body.amount);
  }

  /**
   * 2. SYMULACJA PŁATNOŚCI (Ręczna)
   */
  @Post('simulate')
  async simulatePayment(@Body() body: { orderId: string }) {
    if (!body.orderId) {
      throw new BadRequestException('Podaj orderId!');
    }
    console.log(`[SYMULACJA] Otrzymano wpłatę dla: ${body.orderId}`);
    return this.ordersService.confirmPayment(body.orderId, 'SIMULATED_TEST');
  }

  /**
   * 3. WEBHOOK (Dla Tpay w przyszłości)
   */
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    const status = body.tr_status;
    const orderId = body.tr_crc;
    const transactionId = body.tr_id;
    const amount = body.tr_amount;

    if (status === 'TRUE' && orderId) {
       await this.ordersService.confirmPayment(orderId, transactionId, amount);
       return 'TRUE';
    }
    return 'FALSE';
  }
}
// Wczesnijeszy controller 

// import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
// import type { Response } from 'express';
// import { PaymentsService } from './payments.service';

// @Controller('payments')
// export class PaymentsController {
//     private readonly logger = new Logger(PaymentsController.name);
//     constructor(private readonly paymentsService: PaymentsService) {}

//     @Post()
//     async createPayment(
//         @Body('token') googleToken: string,
//         @Body('amount') amount: string,
//         @Body('scentId') scentId: string,   
//         @Body('deviceId') deviceId: string,
//         @Body('currency') currency: string = 'PLN'
//     ) {
//         if (!googleToken) return { success: false, error: 'token is required' };
//         if (!scentId || !deviceId) return { success: false, error: 'scentId and deviceId are required' };
//         if (!amount) amount = '1.00';
//         return this.paymentsService.createGooglePayTransaction(googleToken, amount, scentId, deviceId ,currency);
        
//     }

//     @Post('notify')
//     async handleNotify(@Body() body: any, @Res() res: Response) {
//         try {
//             await this.paymentsService.handleNotify(body);
//             // exactly "TRUE"
//             return res.status(HttpStatus.OK).send('TRUE');
//         } catch (e: any) {
//             this.logger.error('Notify error', e.message || e);
//             return res.status(HttpStatus.BAD_REQUEST).send('ERROR');
//         }
//     }
// }
