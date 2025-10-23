import { Module } from '@nestjs/common';
import { ColognesService } from './colognes.service';
import { ColognesController } from './colognes.controller';
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [ColognesController],
    providers: [ColognesService],
})
export class ColognesModule {}
