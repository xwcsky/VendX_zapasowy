import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventsGateway } from 'src/events/events.gateway';
import { DiscountsService } from 'src/discounts/discounts.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway, 
    private discountsService: DiscountsService,
  ) {}

  // Pobiera wszystkie zamówienia
  async findAll() {
    const rows = await this.prisma.orders.findMany({
      orderBy: { creation_date: 'desc' },
      include: { cologne: true }, 
    });

    return rows.map((row) => ({
      id: row.id,
      scentId: row.scent_id,
      deviceId: row.device_id,
      status: row.status,
      quantity: row.quantity,
      amount: row.amount,
      creationDate: row.creation_date,
      cologneName: row.cologne?.cologne_name, 
    }));
  }

  // Tworzenie zamówienia (Status: PENDING)
  async create(dto: CreateOrderDto & { discountCode?: string }) {
    console.log('Tworzę zamówienie:', dto);

    let quantity = dto.quantity || 1;
    let unitPrice = 5.00; 
    let finalAmount = unitPrice * quantity; 

    // --- LOGIKA RABATU ---
    if (dto.discountCode) {
      try {
        const validCode = await this.discountsService.validateCode(dto.discountCode);
        const discountVal = (finalAmount * validCode.percent) / 100;
        finalAmount = finalAmount - discountVal;
        
        if (finalAmount < 0) finalAmount = 0;
        
        console.log(`Zastosowano kod: ${dto.discountCode} (-${validCode.percent}%). Nowa cena: ${finalAmount}`);
        
        // Zużyj kod jeśli 100% zniżki
        if (finalAmount === 0) {
             await this.discountsService.consumeCode(dto.discountCode);
        }
      } catch (e) {
        console.error('Błąd rabatu (ignoruję):', e.message);
      }
    }

    // 1. Zapis do bazy
    const order = await this.prisma.orders.create({
      data: {
        scent_id: dto.scentId,
        device_id: dto.deviceId,
        quantity: dto.quantity || 1, 
        status: finalAmount === 0 ? 'PAID' : 'PENDING', // Jak za darmo, to od razu PAID
        amount: finalAmount, 
      },
    });

    console.log(`Zamówienie ${order.id} utworzone. Czekam na płatność...`);

    if (finalAmount === 0) {
      console.log('Zamówienie darmowe (Admin/VIP). Uruchamiam maszynę!');
      this.eventsGateway.sendToDevice(order.device_id, 'START_PUMP', {
         scentId: order.scent_id,
         quantity: order.quantity,
      });
      // Nie czekamy na Google Pay, bo cena to 0
   }

    return {
      id: order.id,
      status: order.status,
      amount: finalAmount,
      // Zwracamy to, co potrzebne frontendowi do płatności
    };
  }

  // Metoda wywoływana przez Webhook płatności (lub symulator)
  async confirmPayment(orderId: string, transactionId?: string, paidAmount?: string | number) {
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
        amount: paidAmount ? paidAmount : undefined,
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