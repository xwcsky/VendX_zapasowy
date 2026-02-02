import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { ColognesModule } from './colognes/colognes.module';
import { AuthModule } from './auth/auth.module';
import {PaymentsModule} from "./payments/payments.module";
import { EventsModule } from './events/events.module';
import { PrismaModule } from 'prisma/prisma.module';
import { DiscountsModule } from './discounts/discounts.module';

@Module({
  imports: [OrdersModule, ColognesModule, AuthModule, PaymentsModule, PrismaModule,EventsModule, DiscountsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
