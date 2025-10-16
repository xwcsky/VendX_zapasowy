import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { ColognesModule } from './colognes/colognes.module';

@Module({
  imports: [OrdersModule, ColognesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
