import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly TPAY_API_KEY = '826e2bc8574671e80de7293bb22877caa4cc07dd';
    private readonly TPAY_BASE_URL = 'https://secure.snd.tpay.com/api/gw';

    async processPayment(token: string, amount: number, currency: string) {
        try {
            this.logger.log(`Received Google Pay token: ${token.slice(0, 25)}...`);

            const payload = {
                id: 408446,
                amount,
                description: 'Testowa płatność Google Pay',
                crc: Date.now().toString(),
                result_url: 'https://vendx-scentify-api-kcfya.ondigitalocean.app/payments/notify',
                return_url: 'https://vendx.pl/scentify/payment/confirm',
                return_error_url: 'https://vendx.pl/scentify/payment/error',
                email: 'test@client.com',
                name: 'Test User',
                language: 'pl',
                accept_tos: 1,
                api_password: '2ZTt!zMTnyySiQ6',
            };

            const url = `${this.TPAY_BASE_URL}/${this.TPAY_API_KEY}/transaction/create`;

            const response = await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            this.logger.log(`Tpay response: ${JSON.stringify(response.data)}`);

            if (response.data.result === 1 && response.data.url) {
                return { success: true, redirectUrl: response.data.url };
            }

            return { success: false, error: response.data.desc || 'Nie udało się utworzyć transakcji' };
        } catch (error: any) {
            this.logger.error(error);
            return { success: false, error: error.message };
        }
    }
}
