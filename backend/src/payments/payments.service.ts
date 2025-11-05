import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly TPAY_SANDBOX_URL = 'https://secure.tpay.com';
    private readonly MERCHANT_ID = '408446';
    private readonly VERIFY_CODE = '3edc2413172c4fe13645d5fb3cc7bad4';

    async processPayment(token: string, amount: number, currency: string) {
        try {
            // W sandboxie tworzysz fikcyjną transakcję (token możesz po prostu logować)
            this.logger.log(`Received Google Pay token: ${token.slice(0, 30)}...`);

            const data = {
                id: this.MERCHANT_ID,
                amount: amount,
                description: 'Testowa płatność Google Pay',
                crc: Date.now().toString(),
                result_url: 'https://vendx-scentify-api-kcfya.ondigitalocean.app/payments/notify',
                return_url: 'https://vendx.pl/scentify/payment/confirm', // 👉 gdzie użytkownik trafi po płatności
                email: 'test@client.com',
                name: 'Test User'
            };

            const form = qs.stringify(data);
            const response = await axios.post(`${this.TPAY_SANDBOX_URL}`, form, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            // Tpay przekierowuje użytkownika na stronę płatności
            return { success: true, redirectUrl: response.request.res.responseUrl };
        } catch (error: any) {
            this.logger.error(error);
            return { success: false, error: error.message };
        }
    }

    async confirmTpayPayment(data: any) {
        this.logger.log(`🔄 Potwierdzono płatność Tpay dla transakcji ${data.tr_id}`);
        return { success: true };
    }
}
