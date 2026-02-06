import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' } // Najnowsze na górze
    });
  }

  async toggleStatus(id: string) {
    const code = await this.prisma.discountCode.findUnique({ where: { id } });
    if (!code) throw new NotFoundException('Kod nie istnieje');

    return this.prisma.discountCode.update({
      where: { id },
      data: { active: !code.active } // Odwracamy wartość (true -> false)
    });
  }

  async remove(id: string) {
    return this.prisma.discountCode.delete({
      where: { id }
    });
  }

  async validateCode(code: string) {
    const discount = await this.prisma.discountCode.findUnique({
      where: { code: code },
    });

    if (!discount) {
      throw new NotFoundException('Kod nieprawidłowy');
    }

    if (!discount.active) {
      throw new BadRequestException('Kod jest nieaktywny');
    }

    if (discount.usedCount >= discount.maxUsages) {
      throw new BadRequestException('Limit użyć tego kodu został wyczerpany');
    }

    return {
      code: discount.code,
      percent: discount.percent,
      remaining: discount.maxUsages - discount.usedCount
    };
  }

  // Zużycie kodu (Wywołamy to, gdy zamówienie się uda)
  async consumeCode(code: string) {
    // Ponowne sprawdzenie
    const discount = await this.prisma.discountCode.findUnique({ where: { code } });
    if (discount && discount.usedCount < discount.maxUsages) {
      await this.prisma.discountCode.update({
        where: { code },
        data: { usedCount: { increment: 1 } }
      });
    }
  }
  
  // Metoda pomocnicza do tworzenia kodów (np. przez seeda lub ręcznie)
  create(data: any) {
    return this.prisma.discountCode.create({ data });
  }
}