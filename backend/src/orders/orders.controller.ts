import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    // GET /orders - pobiera wszystkie zamówienia
    @Get()
    async findAll() {
        return this.ordersService.findAll();
    }

    // POST /orders - tworzy nowe zamówienie
    @Post()
    async create(@Body() dto: CreateOrderDto) {
        return this.ordersService.create(dto);
    }
}
