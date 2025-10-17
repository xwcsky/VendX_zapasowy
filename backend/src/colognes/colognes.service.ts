import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCologneDto } from './dto/create-cologne.dto';

@Injectable()
export class ColognesService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        const rows = await this.prisma.colognes.findMany({
            orderBy: { cologne_name: 'desc' }, // sortowanie od najnowszych
        });

        // Mapowanie z snake_case (DB) na camelCase (API)
        return rows.map(row => ({
            id: row.id,
            brandName: row.brand_name,
            cologneName: row.cologne_name,
        }));
    }

    // Tworzy nowe zamówienie
    async create(dto: CreateCologneDto) {
        console.log('Tworzę zamówienie z DTO:', dto);

        const row = await this.prisma.colognes.create({
            data: {
                brand_name: dto.brandName,
                cologne_name: dto.cologneName
            },
        });

        return {
            id: row.id,
            brandName: row.brand_name,
            cologneName: row.cologne_name
        };
    }
}
