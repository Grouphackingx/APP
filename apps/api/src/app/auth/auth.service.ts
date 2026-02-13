import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from '@open-ticket/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }

    async register(registerDto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: registerDto.email } });
        if (existing) throw new ConflictException('Email already exists');

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...registerDto,
                password: hashedPassword,
            },
        });
        const { password, ...result } = user;
        return result;
    }
}
