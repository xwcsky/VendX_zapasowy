import {Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) {}

    async validateUser(userName: string, password: string) {
        const user = await this.prisma.users.findUnique({
            where: { user_name: userName } // 👈 poprawione
        });

        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return null;

        return user;
    }

    async login(userName: string, password: string) {
        const user = await this.validateUser(userName, password);
        if (!user) throw new UnauthorizedException('Niepoprawne dane logowania');

        const payload = { sub: user.id, user_name: user.user_name };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

}
