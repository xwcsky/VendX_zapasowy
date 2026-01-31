import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    // GET /orders - pobiera wszystkie zamówienia
    // @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        return this.ordersService.findAll();
    }

    // POST /orders - tworzy nowe zamówienie
    // @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() dto: CreateOrderDto) {
        return this.ordersService.create(dto);
    }
}
