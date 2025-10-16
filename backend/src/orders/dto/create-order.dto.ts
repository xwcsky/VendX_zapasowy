import { IsString } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    scentId: string;

    @IsString()
    deviceId: string;
}