import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class PaymentsService {
  private logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  /**
   * ✅ UNIWERSALNA METODA SUKCESU
   * Niezależnie czy to P24, Google Pay, czy BLIK.
   * Jak kasa jest na koncie -> wywołujemy to.
   */
  async markAsPaid(orderId: string, transactionId?: string) {
    this.logger.log(`💰 Oznaczanie zamówienia ${orderId} jako OPŁACONE`);

    // 1. Aktualizacja w bazie
    // Używamy "orders" (liczba mnoga) i "transaction_id" (z podkreślnikiem)
    const updatedOrder = await this.prisma.orders.update({
      where: { id: orderId },
      data: { 
        status: 'PAID',
        transaction_id: transactionId || `MANUAL_${Date.now()}` // Jeśli brak ID, generujemy własne
      }
    });

    // 2. Powiadomienie Frontendu przez WebSocket
    // "Hej frontendzie, wyświetl ekran Dziękujemy!"
    this.eventsGateway.notifyOrderUpdate(orderId, 'PAID');

    return updatedOrder;
  }
}