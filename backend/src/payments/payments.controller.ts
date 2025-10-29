import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import * as crypto from 'crypto';

@Controller('payments')
export class PaymentsController {
    private readonly logger = new Logger(PaymentsController.name);
    private readonly VERIFY_CODE = '3edc2413172c4fe13645d5fb3cc7bad4';
    private readonly MERCHANT_ID = '408446';

    constructor(private readonly paymentsService: PaymentsService) {}

    @Post()
    async createPayment(
        @Body('token') token: string,
        @Body('amount') amount: number,
        @Body('currency') currency: string
    ) {
        if (!token) return { success: false, error: 'Token is required' };
        return this.paymentsService.processPayment(token, amount, currency);
    }

    @Post('notify')
    async handleTpayNotify(@Body() body: any, @Res() res: Response) {
        this.logger.log('📩 Odebrano powiadomienie Tpay', body);

        // Obliczenie lokalnego podpisu
        const md5Input = this.MERCHANT_ID + body.tr_id + body.tr_amount + body.tr_crc + this.VERIFY_CODE;
        const md5Local = crypto.createHash('md5').update(md5Input).digest('hex');

        if (md5Local !== body.md5sum) {
            this.logger.error('❌ Nieprawidłowy podpis Tpay');
            return res.status(HttpStatus.BAD_REQUEST).send('Invalid signature');
        }

        if (body.tr_status === 'TRUE') {
            this.logger.log(`✅ Transakcja ${body.tr_id} zakończona sukcesem`);
            await this.paymentsService.confirmTpayPayment(body);
        } else {
            this.logger.warn(`⚠️ Transakcja ${body.tr_id} ma status ${body.tr_status}`);
        }

        // Zwracamy dokładnie "TRUE"
        return res.status(HttpStatus.OK).send('TRUE');
    }
}
