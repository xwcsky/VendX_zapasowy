import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'supersecret', // ustaw swój klucz w .env
        });
    }

    async validate(payload: any) {
        // payload to dane w tokenie, np. { sub: userId, email: userEmail }
        return { userId: payload.sub, email: payload.email };
    }
}