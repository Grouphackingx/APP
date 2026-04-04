import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RegisterHostDto } from '@open-ticket/shared';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(200)
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('register-host')
    registerHost(@Body() registerHostDto: RegisterHostDto) {
        return this.authService.registerHost(registerHostDto);
    }
}
