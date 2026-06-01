import { Body, Controller, Get, Patch, Post, HttpCode, UseGuards, Request, Req, ForbiddenException, Query } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RegisterHostDto, UpdateProfileDto, UpdateBasicInfoDto, UpdateOrganizerProfileInfoDto } from '@open-ticket/shared';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(200)
    login(@Body() loginDto: LoginDto, @Req() req: ExpressRequest) {
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
            || req.socket?.remoteAddress
            || 'unknown';
        return this.authService.login(loginDto, ip);
    }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

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

    @Post('resend-verification')
    @HttpCode(200)
    resendVerification(@Body('email') email: string) {
        return this.authService.resendVerification(email);
    }

    @Post('forgot-password')
    @HttpCode(200)
    forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    @HttpCode(200)
    resetPassword(@Body('token') token: string, @Body('password') password: string) {
        return this.authService.resetPassword(token, password);
    }
}
