import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ColognesService } from "./colognes.service";
import { CreateCologneDto } from "./dto/create-cologne.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller('colognes')
export class ColognesController {

    constructor(private readonly colognesService: ColognesService) {}
    // GET /orders - pobiera wszystkie zamówienia
    // @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        return this.colognesService.findAll();
    }

    // POST /orders - tworzy nowe zamówienie
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() dto: CreateCologneDto) {
        return this.colognesService.create(dto);
    }
}
