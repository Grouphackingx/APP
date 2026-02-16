import { IsDateString, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateZoneDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsNumber()
    @Min(0)
    price!: number;

    @IsNumber()
    @Min(1)
    capacity!: number;
}

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsNotEmpty()
    date!: string;

    @IsString()
    @IsNotEmpty()
    location!: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    mapUrl?: string;

    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    galleryUrls?: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateZoneDto)
    zones!: CreateZoneDto[];
}
