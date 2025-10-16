// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 🔹 Dodaj globalny pipe dla DTO
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,      // usuwa nieznane pola z body
        forbidNonWhitelisted: true, // rzuca błąd jeśli pojawią się nieznane pola
        transform: true,      // automatycznie konwertuje JSON na instancję DTO
    }));

    app.enableCors({
        origin: 'http://localhost:4200', // Angular
        methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
        credentials: true, // jeśli wysyłasz cookies / auth
    });

    await app.listen(3000);
}
bootstrap();