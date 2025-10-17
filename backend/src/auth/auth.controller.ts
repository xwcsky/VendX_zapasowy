import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() body: { user_name: string; password: string }) {
        const { user_name, password } = body;

        const token = await this.authService.login(user_name, password);
        if (!token) throw new UnauthorizedException('Niepoprawne dane logowania');

        return token;
    }
}
