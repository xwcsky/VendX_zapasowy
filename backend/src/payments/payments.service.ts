import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    async processPayment(token: string, amount: number, currency: string) {
        try {
            const response = await axios.post('https://api.example-gateway.com/pay', {
                token,
                amount,
                currency
            }, {
                headers: { Authorization: `Bearer YOUR_GATEWAY_SECRET_KEY` }
            });

            return { success: true, gatewayResponse: response.data };
        } catch (error: any) {
            this.logger.error(error);
            return { success: false, error: error.message };
        }
    }

    async confirmTpayPayment(data: any) {
        this.logger.log(`🔄 Potwierdzono płatność Tpay dla transakcji ${data.tr_id}`);

        // TODO: tutaj możesz:
        // - zaktualizować status zamówienia w DB (np. markAsPaid)
        // - wysłać mail do klienta
        // - zapisać log do bazy

        return { success: true };
    }
}
