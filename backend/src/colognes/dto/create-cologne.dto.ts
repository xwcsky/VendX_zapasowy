import { IsString } from 'class-validator';

export class CreateCologneDto {
    @IsString()
    brandName: string;

    @IsString()
    cologneName: string;

    @IsString()
    imageUrl: string;
}