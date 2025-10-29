import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { ColognesModule } from './colognes/colognes.module';
import { AuthModule } from './auth/auth.module';
import {PaymentsModule} from "./payments/payments.module";

@Module({
  imports: [OrdersModule, ColognesModule, AuthModule, PaymentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
