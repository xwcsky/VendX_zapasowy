import { Controller, Post, Body } from '@nestjs/common';
import { DiscountsService } from './discounts.service';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post('check')
  check(@Body() body: { code: string }) {
    return this.discountsService.validateCode(body.code);
  }
  
  // Endpoint do tworzenia kodów (np. przez Postmana lub Admina w przyszłości)
  @Post()
  create(@Body() body: any) {
    return this.discountsService.create(body);
  }
}