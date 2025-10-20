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

    app.use((req, res, next) => {
        console.log('Request from:', req.headers.origin);
        console.log('Auth header:', req.headers.authorization);
        next();
    });

    app.enableCors({
        origin: [
            'http://192.168.1.17:4200',
            'http://192.168.8.100:4200',
            'http://localhost:4200'
        ],
        methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Authorization'],
        credentials: true,
    });


    await app.listen(3000);
}
bootstrap();