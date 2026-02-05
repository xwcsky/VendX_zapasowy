import { Controller, Post, Body, HttpCode, BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { P24Service } from './p24.service';

@Controller('payments')
export class PaymentsController {
  constructor(
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

    // Wygeneruj link w P24
    const redirectUrl = await this.p24Service.registerTransaction(order);

    return { redirectUrl };
  }

  @Post('p24/notify')
  @HttpCode(200) // P24 oczekuje statusu 200 OK
  async handleP24Notification(@Body() body: any) {
    console.log('[P24 Webhook] Otrzymano powiadomienie:', body);

    const isVerified = await this.p24Service.verifyTransaction(body);

    if (isVerified) {
       console.log(`[P24] Płatność potwierdzona dla: ${body.sessionId}`);
       // sessionId to u nas orderId
       await this.ordersService.confirmPayment(body.sessionId, `P24-${body.orderId}`, body.amount / 100);
    }

    return 'OK';
  }
  
  @Post()
  async handleGooglePay(@Body() body: any) {
    console.log('[GooglePay] Otrzymano token:', body);

    // Ponieważ frontend w finalizePayment nie wysyła orderId (tylko deviceId i scentId),
    // musimy znaleźć, które zamówienie jest "otwarte" dla tego urządzenia.
    
    // Pobieramy wszystkie zamówienia (to rozwiązanie tymczasowe, w produkcji przekażemy orderId)
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
