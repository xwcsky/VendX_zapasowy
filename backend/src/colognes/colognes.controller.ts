import {Body, Controller, Get, Post} from '@nestjs/common';
import {OrdersService} from "../orders/orders.service";
import { ColognesService } from "./colognes.service";
import {CreateCologneDto} from "./dto/create-cologne.dto";

@Controller('colognes')
export class ColognesController {

    constructor(private readonly colognesService: ColognesService) {}
    // GET /orders - pobiera wszystkie zamówienia
    @Get()
    async findAll() {
        return this.colognesService.findAll();
    }

    // POST /orders - tworzy nowe zamówienie
    @Post()
    async create(@Body() dto: CreateCologneDto) {
        return this.colognesService.create(dto);
    }
}
