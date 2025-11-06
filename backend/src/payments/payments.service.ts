import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    private readonly merchantId = process.env.TPAY_MERCHANT_ID!;
    private readonly verifyCode = process.env.TPAY_VERIFY_CODE!;
    private readonly notifyUrl = process.env.TPAY_NOTIFY_URL!;
    private readonly returnOk = process.env.TPAY_RETURN_OK!;
    private readonly returnErr = process.env.TPAY_RETURN_ERR!;

    private readonly tpayUrl =
        process.env.TPAY_ENV === 'prod'
            ? 'https://secure.tpay.com'
            : 'https://secure.tpay.com'; // sandbox także na secure.tpay.com (test_mode=1)

    /**
     * ✅ Tworzenie transakcji Google Pay w Classic API
     */
    async createGooglePayTransaction(googleToken: string, amount: number, currency: string) {
        const crc = `order_${Date.now()}`;
        const amountStr = amount.toFixed(2);

        const payload = {
            id: this.merchantId,
            amount: amountStr,
            description: 'Płatność Google Pay',
            crc,
            test_mode: 1,                                // ✅ sandbox flag
            result_url: this.notifyUrl,
            return_url: this.returnOk,
            return_error_url: this.returnErr,
            email: 'test@client.com',
            name: 'Test Sandbox User',
            language: 'pl',
            group: 166,                                  // ✅ Google Pay DIRECT
            googlePayPaymentData: googleToken,           // ✅ token z frontu
        };

        try {
            const res = await axios.post(
                this.tpayUrl,
                qs.stringify(payload),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    maxRedirects: 0,                          // ✅ przechwyt redirecta
                    validateStatus: (s) => s === 302 || (s >= 200 && s < 400),
                }
            );

            const redirectUrl = res.request.res.responseUrl;
            this.logger.log(`✅ Tpay redirect URL: ${redirectUrl}`);

            return { success: true, crc, redirectUrl };
        } catch (error: any) {
            this.logger.error('❌ Tpay create error:', error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    /**
     * ✅ Obsługa NOTIFY z Tpay + MD5 verify
     */
    handleNotify(body: any) {
        this.logger.log('📩 Notify:', body);

        const md5Input =
            this.merchantId +
            body.tr_id +
            body.tr_amount +
            body.tr_crc +
            this.verifyCode;

        const localMd5 = crypto.createHash('md5').update(md5Input).digest('hex');

        if (localMd5 !== body.md5sum) {
            this.logger.error('❌ Invalid signature');
            throw new Error('Invalid MD5 signature');
        }

        this.logger.log(`✅ Payment confirmed: ${body.tr_id}`);
        return true; // kontroler zwróci "TRUE"
    }
}
