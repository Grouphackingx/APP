import { Body, Controller, Get, Patch, Post, HttpCode, UseGuards, Request, Req, ForbiddenException, Query } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RegisterHostDto, UpdateProfileDto, UpdateBasicInfoDto, UpdateOrganizerProfileInfoDto } from '@open-ticket/shared';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // 10 intentos por IP cada 15 minutos — previene fuerza bruta
    @Throttle({ long: { limit: 10, ttl: 900000 } })
    @Post('login')
    @HttpCode(200)
    login(@Body() loginDto: LoginDto, @Req() req: ExpressRequest) {
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
            || req.socket?.remoteAddress
            || 'unknown';
        return this.authService.login(loginDto, ip);
    }

    // 10 registros por IP por hora — previene creación masiva de cuentas
    @Throttle({ long: { limit: 10, ttl: 3600000 } })
    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    // 5 registros de organizador por IP por hora
    @Throttle({ long: { limit: 5, ttl: 3600000 } })
    @Post('register-host')
    registerHost(@Body() registerHostDto: RegisterHostDto) {
        return this.authService.registerHost(registerHostDto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.userId);
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
        return this.authService.updateProfile(req.user.userId, dto);
    }

    @Get('me/organizer')
    @UseGuards(JwtAuthGuard)
    getOrganizerProfile(@Request() req: any) {
        return this.authService.getOrganizerFullProfile(req.user.userId, req.user.isMember ?? false);
    }

    @Patch('me/basic')
    @UseGuards(JwtAuthGuard)
    updateBasicInfo(@Request() req: any, @Body() dto: UpdateBasicInfoDto) {
        return this.authService.updateBasicInfo(req.user.userId, req.user.isMember ?? false, dto);
    }

    @Patch('me/password')
    @UseGuards(JwtAuthGuard)
    changePassword(@Request() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
        return this.authService.changePassword(req.user.userId, req.user.isMember ?? false, body.currentPassword, body.newPassword);
    }

    @Patch('me/organizer-profile')
    @UseGuards(JwtAuthGuard)
    updateOrganizerProfile(@Request() req: any, @Body() dto: UpdateOrganizerProfileInfoDto) {
        if (req.user.isMember) throw new ForbiddenException('Solo el organizador principal puede actualizar el perfil de la organización');
        return this.authService.updateOrganizerProfileInfo(req.user.userId, dto);
    }

    @Get('verify-email')
    @HttpCode(200)
    verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    // 5 reenvíos por IP cada 15 minutos — previene spam de emails de verificación
    @Throttle({ long: { limit: 5, ttl: 900000 } })
    @Post('resend-verification')
    @HttpCode(200)
    resendVerification(@Body('email') email: string) {
        return this.authService.resendVerification(email);
    }

    // 5 solicitudes por IP cada 15 minutos — previene spam de emails de reset
    @Throttle({ long: { limit: 5, ttl: 900000 } })
    @Post('forgot-password')
    @HttpCode(200)
    forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    // 10 intentos por IP cada 15 minutos — el token ya expira en 1h
    @Throttle({ long: { limit: 10, ttl: 900000 } })
    @Post('reset-password')
    @HttpCode(200)
    resetPassword(@Body('token') token: string, @Body('password') password: string) {
        return this.authService.resetPassword(token, password);
    }
}
