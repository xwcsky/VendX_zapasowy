import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import * as crypto from 'crypto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly merchantId = process.env.TPAY_MERCHANT_ID!;
    private readonly verifyCode = process.env.TPAY_VERIFY_CODE!;
    private readonly notifyUrl = process.env.TPAY_NOTIFY_URL!;
    private readonly returnOk = process.env.TPAY_RETURN_OK!;
    private readonly returnErr = process.env.TPAY_RETURN_ERR!;
    private readonly tpayUrl = 'https://secure.tpay.com'; // classic endpoint (sandbox via test_mode)

    /**
     * Create Classic API transaction with googlePayPaymentData (DIRECT token).
     * googleToken: string (may be JSON-stringified)
     * amount: string (e.g. "1.00")
     */
    constructor(private readonly ordersService: OrdersService) {}

    async createGooglePayTransaction(googleToken: string, amount: string, scentId: string, deviceId: string, currency = 'PLN') {
        try {
            // ensure token is string; if it's JSON object stringify it
            let tokenToSend = googleToken;
            if (typeof googleToken !== 'string') tokenToSend = JSON.stringify(googleToken);

            // some libs return stringified JSON inside a string (double-serialized) — try to normalize
            try {
                const parsed = JSON.parse(googleToken);
                // if parsed has protocolVersion or signature, re-stringify parsed (clean)
                if (parsed && (parsed.protocolVersion || parsed.signature || parsed.signedMessage)) {
                    tokenToSend = JSON.stringify(parsed);
                }
            } catch (e) {
                // not JSON — fine
            }

            const crc = `order_${scentId}_${deviceId}_${Date.now()}`;

            const payload = {
                id: this.merchantId,
                amount: amount, // string format "1.00"
                description: `Order: ${scentId} @ ${deviceId}`,
                crc,
                test_mode: 1,
                result_url: this.notifyUrl,
                return_url: this.returnOk,
                return_error_url: this.returnErr,
                email: 'test@client.com',
                name: 'Test Sandbox User',
                language: 'pl',
                group: 166, // Google Pay channel in Tpay Classic
                googlePayPaymentData: tokenToSend
            };

            this.logger.log(`Creating Tpay transaction (crc=${crc})...`);
            this.logger.debug(`Payload sample (truncated): ${JSON.stringify({ id: payload.id, amount: payload.amount, crc: payload.crc, group: payload.group }).slice(0, 400)}`);

            const res = await axios.post(this.tpayUrl, qs.stringify(payload), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                maxRedirects: 0,
                validateStatus: (s) => s === 302 || (s >= 200 && s < 400)
            });

            // capture redirect URL returned by Tpay (Location)
            const redirectUrl = res.headers?.location || (res.request?.res?.responseUrl);
            this.logger.log(`Tpay returned redirectUrl: ${redirectUrl}`);

            return { success: true, crc, redirectUrl };
        } catch (err: any) {
            this.logger.error('Tpay create transaction error', err.response?.data || err.message);
            return { success: false, error: err.response?.data || err.message };
        }
    }

    async handleNotify(body: any) {
        this.logger.log('Tpay notify received', body);

        const required = ['tr_id', 'tr_amount', 'tr_crc', 'md5sum', 'tr_status'];
        for (const f of required) {
            if (!body[f]) throw new Error(`Missing notify field: ${f}`);
        }

        const md5Input = this.merchantId + body.tr_id + body.tr_amount + body.tr_crc + this.verifyCode;
        const localMd5 = crypto.createHash('md5').update(md5Input).digest('hex');

        if (localMd5 !== body.md5sum) {
            this.logger.error('Invalid MD5 signature. local:', localMd5, 'remote:', body.md5sum);
            throw new Error('Invalid MD5 signature');
        }

        // Here update order DB by tr_crc (body.tr_crc) -> set paid or error
        // For demo just log
        this.logger.log(`Payment status for tr_id=${body.tr_id}, crc=${body.tr_crc}, status=${body.tr_status}`);

        if (body.tr_status === 'TRUE') {
            try {
                // Parsowanie CRC: order_SCENT_DEVICE_TIMESTAMP
                const parts = body.tr_crc.split('_');
                // Spodziewamy się min. 4 części: ["order", "scentUUID", "deviceID", "timestamp"]
                if (parts.length >= 4 && parts[0] === 'order') {
                    const scentId = parts[1];
                    const deviceId = parts[2];
                    
                    this.logger.log(`Creating order in DB for scentId=${scentId}, deviceId=${deviceId}`);
                    
                    await this.ordersService.create({
                        scentId: scentId,
                        deviceId: deviceId,
                        quantity: 1
                    });
                    
                    this.logger.log('Order created successfully.');
                } else {
                    this.logger.warn(`CRC format not recognized for auto-order creation: ${body.tr_crc}`);
                }
            } catch (error) {
                this.logger.error('Error creating order from payment notification', error);
                // Rzucamy błąd, aby Tpay ewentualnie ponowił próbę (chyba że błąd jest logiczny)
                throw error;
            }
        }

        return true;
    }
}
