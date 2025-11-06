import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post()
    async createPayment(
        @Body('token') googlePayToken: string,
        @Body('amount') amount: number,
        @Body('currency') currency: string,
    ) {
        if (!googlePayToken) return { success: false, error: 'Token missing' };
        return this.paymentsService.createGooglePayTransaction(
            googlePayToken,
            amount,
            currency || 'PLN'
        );
    }

    @Post('notify')
    async notify(@Body() body: any, @Res() res: Response) {
        try {
            this.paymentsService.handleNotify(body);
            return res.status(HttpStatus.OK).send('TRUE');   // ✅ musi być EXACT "TRUE"
        } catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).send('ERROR');
        }
    }
}
