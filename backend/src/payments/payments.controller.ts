import { Controller, Post, Body, HttpCode, BadRequestException } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * SYMULACJA PŁATNOŚCI (Dla Ciebie do testów)
   * Użyj tego endpointu, żeby ręcznie potwierdzić płatność i uruchomić pompkę.
   * URL: POST http://localhost:3000/payments/simulate
   * Body: { "orderId": "tu-wklej-id-zamowienia" }
   */
  @Post('simulate')
  async simulatePayment(@Body() body: { orderId: string }) {
    if (!body.orderId) {
      throw new BadRequestException('Podaj orderId!');
    }

    console.log(`[SYMULACJA] Otrzymano wpłatę dla: ${body.orderId}`);
    
    // To wywoła całą lawinę: Zmiana w Bazie -> WebSocket -> Arduino
    return this.ordersService.confirmPayment(body.orderId, 'SIMULATED_TEST');
  }

  /**
   * PRAWDZIWY WEBHOOK (Np. dla Tpay/Stripe)
   * Tutaj przychodzą powiadomienia z bramki płatniczej.
   */
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    console.log('[WEBHOOK] Otrzymano dane:', body);

    // Przykładowa logika dla Tpay (zależy od dokumentacji bramki):
    // Tpay wysyła np. tr_id, tr_status='TRUE', tr_crc (którym jest u nas orderId)
    
    const status = body.tr_status; // "TRUE" lub "FALSE"
    const orderId = body.tr_crc;   // Nasz ID zamówienia
    const transactionId = body.tr_id;

    if (status === 'TRUE' && orderId) {
       await this.ordersService.confirmPayment(orderId, transactionId);
       return 'TRUE'; // Tpay wymaga odpowiedzi TRUE
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
