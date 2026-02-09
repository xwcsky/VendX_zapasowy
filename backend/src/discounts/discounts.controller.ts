import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { DiscountsService } from './discounts.service';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  findAll() {
    return this.discountsService.findAll();
  }

  @Patch(':id/status')
  toggleStatus(@Param('id') id: string) {
    return this.discountsService.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountsService.remove(id);
  }

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