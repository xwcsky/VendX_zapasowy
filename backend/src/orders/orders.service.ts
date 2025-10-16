import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) {}

    // Pobiera wszystkie zamówienia
    async findAll() {
        const rows = await this.prisma.orders.findMany({
            orderBy: { creation_date: 'desc' }, // sortowanie od najnowszych
        });

        // Mapowanie z snake_case (DB) na camelCase (API)
        return rows.map(row => ({
            id: row.id,
            scentId: row.scent_id,
            deviceId: row.device_id,
            creationDate: row.creation_date,
        }));
    }

    // Tworzy nowe zamówienie
    async create(dto: CreateOrderDto) {
        console.log('Tworzę zamówienie z DTO:', dto);

        const row = await this.prisma.orders.create({
            data: {
                scent_id: dto.scentId,
                device_id: dto.deviceId,
            },
        });

        return {
            id: row.id,
            scentId: row.scent_id,
            deviceId: row.device_id,
            creationDate: row.creation_date,
        };
    }

}
