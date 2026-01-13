import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
    private readonly logger = new Logger(PaymentsController.name);
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post()
    async createPayment(
        @Body('token') googleToken: string,
        @Body('amount') amount: string,
        @Body('scentId') scentId: string,   
        @Body('deviceId') deviceId: string,
        @Body('currency') currency: string = 'PLN'
    ) {
        if (!googleToken) return { success: false, error: 'token is required' };
        if (!scentId || !deviceId) return { success: false, error: 'scentId and deviceId are required' };
        if (!amount) amount = '1.00';
        return this.paymentsService.createGooglePayTransaction(googleToken, amount, scentId, deviceId ,currency);
        
    }

    @Post('notify')
    async handleNotify(@Body() body: any, @Res() res: Response) {
        try {
            await this.paymentsService.handleNotify(body);
            // exactly "TRUE"
            return res.status(HttpStatus.OK).send('TRUE');
        } catch (e: any) {
            this.logger.error('Notify error', e.message || e);
            return res.status(HttpStatus.BAD_REQUEST).send('ERROR');
        }
    }
}
