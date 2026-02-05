import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OrdersModule } from '../orders/orders.module';
import { HttpModule } from '@nestjs/axios';
import { P24Service } from './p24.service';

@Module({
    imports: [OrdersModule, HttpModule],
    controllers: [PaymentsController],
    providers: [PaymentsService, P24Service],
})
export class PaymentsModule {}
