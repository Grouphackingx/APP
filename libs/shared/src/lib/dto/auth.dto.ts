import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString, Matches } from 'class-validator';

const PHONE_REGEX = /^\+?[0-9][\d\s\-()+.]{5,14}$/;

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @Matches(PHONE_REGEX, { message: 'Formato de teléfono inválido. Ej: 0991234567 o +593991234567' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}

export enum HostPlanType {
  FREE = 'FREE',
  PLUS = 'PLUS',
  ELITE = 'ELITE'
}

export class RegisterHostDto extends RegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  identificationNumber!: string;

  @Matches(PHONE_REGEX, { message: 'Formato de teléfono inválido. Ej: 0991234567 o +593991234567' })
  @IsString()
  @IsNotEmpty()
  override phone!: string;

  @IsString()
  @IsNotEmpty()
  organizationName!: string;

  @IsString()
  @IsOptional()
  organizationDescription?: string;

  @IsString()
  @IsOptional()
  organizationLogo?: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  province!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsOptional()
  plan?: string;
}

export class UpdateBasicInfoDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @Matches(PHONE_REGEX, { message: 'Formato de teléfono inválido. Ej: 0991234567 o +593991234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword!: string;
}

export class UpdateOrganizerProfileInfoDto {
  @IsString()
  @IsOptional()
  organizationName?: string;

  @IsString()
  @IsOptional()
  organizationDescription?: string;

  @IsString()
  @IsOptional()
  organizationLogo?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  city?: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @Matches(PHONE_REGEX, { message: 'Formato de teléfono inválido. Ej: 0991234567 o +593991234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  idType?: string;

  @IsString()
  @IsOptional()
  idNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  citizenship?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
