import { IsDateString, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateZoneDto {
    @IsString()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;

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
    province?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    seatingMapImageUrl?: string;

    @IsBoolean()
    @IsOptional()
    hasSeatingChart?: boolean;

    @IsString()
    @IsOptional()
    mapUrl?: string;

    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    galleryUrls?: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateZoneDto)
    @IsOptional()
    zones!: CreateZoneDto[];
}

import { PartialType } from '@nestjs/mapped-types';
export class UpdateEventDto extends PartialType(CreateEventDto) {}
