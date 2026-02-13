import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class LockSeatsDto {
    @IsString()
    @IsNotEmpty()
    eventId!: string;

    @IsArray()
    @IsString({ each: true })
    seatIds!: string[];
}

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    eventId!: string;

    @IsArray()
    @IsString({ each: true })
    seatIds!: string[];
}
