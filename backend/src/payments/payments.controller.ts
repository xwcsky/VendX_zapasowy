import { Controller, Post, Body, HttpCode, BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * 1. OBSŁUGA GOOGLE PAY (Z FRONTENDU)
   * To jest endpoint, na który strzela Twoja aplikacja po kliknięciu "Zapłać".
   */
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
    return this.ordersService.confirmPayment(pendingOrder.id, 'GOOGLE_PAY_DEMO_TOKEN');
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

    if (status === 'TRUE' && orderId) {
       await this.ordersService.confirmPayment(orderId, transactionId);
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
