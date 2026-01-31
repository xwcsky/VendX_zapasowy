import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway, // <-- Wstrzykujemy Gateway
  ) {}

  // Pobiera wszystkie zamówienia
  async findAll() {
    const rows = await this.prisma.orders.findMany({
      orderBy: { creation_date: 'desc' },
      include: { cologne: true }, // Dołączamy dane o perfumach
    });

    return rows.map((row) => ({
      id: row.id,
      scentId: row.scent_id,
      deviceId: row.device_id,
      status: row.status,
      quantity: row.quantity,
      amount: row.amount,
      creationDate: row.creation_date,
      cologneName: row.cologne?.cologne_name, // Opcjonalnie do wyświetlania
    }));
  }

  // Tworzenie zamówienia (Status: PENDING)
  async create(dto: CreateOrderDto) {
    console.log('Tworzę zamówienie:', dto);

    // 1. Zapis do bazy
    const order = await this.prisma.orders.create({
      data: {
        scent_id: dto.scentId,
        device_id: dto.deviceId,
        quantity: dto.quantity || 1, // Domyślnie 1 psik
        status: 'PENDING',
        amount: 5.00, // Tu docelowo możesz pobierać cenę z bazy perfum * quantity
      },
    });

    console.log(`Zamówienie ${order.id} utworzone. Czekam na płatność...`);

    return {
      id: order.id,
      status: order.status,
      // Zwracamy to, co potrzebne frontendowi do płatności
    };
  }

  // Metoda wywoływana przez Webhook płatności (lub symulator)
  async confirmPayment(orderId: string, transactionId?: string) {
    console.log(`Potwierdzam płatność dla zamówienia: ${orderId}`);

    // 1. Znajdź zamówienie
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Zamówienie nie istnieje');
    }

    if (order.status === 'PAID') {
      console.log('To zamówienie jest już opłacone.');
      return order;
    }

    // 2. Zaktualizuj status w bazie
    const updatedOrder = await this.prisma.orders.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        transaction_id: transactionId || 'SIMULATED',
      },
    });

    // 3. LOGIKA SPRZĘTOWA: Wyślij rozkaz do Raspberry Pi przez WebSocket!
    // Format komendy: START_PUMP
    // Payload: { scentId: "2", quantity: 3 }
    
    this.eventsGateway.sendToDevice(order.device_id, 'START_PUMP', {
      scentId: order.scent_id,
      quantity: order.quantity,
    });

    // 4. Powiadom Frontend (że sukces)
    this.eventsGateway.notifyOrderUpdate(order.id, 'PAID');

    console.log(`--> ROZKAZ WYSŁANY do urządzenia ${order.device_id} (Zapach: ${order.scent_id}, Ilość: ${order.quantity})`);

    return updatedOrder;
  }
}