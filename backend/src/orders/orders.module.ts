import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventsModule } from 'src/events/events.module';
import { DiscountsModule } from 'src/discounts/discounts.module';

@Module({
    imports: [
        PrismaModule,
        EventsModule,
        DiscountsModule
    ], 
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule {}
