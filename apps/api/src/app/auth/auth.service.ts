import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto, RegisterHostDto, UpdateProfileDto } from '@open-ticket/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { organizerProfile: true }
        });
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        if (user.role === 'HOST' && user.organizerProfile?.status === 'PENDING') {
            throw new UnauthorizedException('Tu cuenta de organizador aún está en revisión. Te notificaremos cuando sea aprobada.');
        }

        if (user.role === 'HOST' && user.organizerProfile?.status === 'REJECTED') {
            throw new UnauthorizedException('Tu solicitud de cuenta de organizador fue rechazada. Contacta a soporte para más detalles.');
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
            data: { ...registerDto, password: hashedPassword },
        });
        const { password, ...result } = user;
        return result;
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, email: true, name: true, phone: true, role: true,
                avatarUrl: true, idType: true, idNumber: true, address: true,
                province: true, city: true, birthDate: true, citizenship: true, createdAt: true,
            },
        });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        return user;
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const { password, email, birthDate, ...rest } = dto;
        const data: Record<string, unknown> = { ...rest };

        if (email) {
            const existing = await this.prisma.user.findUnique({ where: { email } });
            if (existing && existing.id !== userId) throw new ConflictException('El email ya está en uso');
            data['email'] = email;
        }

        if (password) {
            data['password'] = await bcrypt.hash(password, 10);
        }

        if (birthDate) {
            data['birthDate'] = new Date(birthDate);
        }

        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true, email: true, name: true, phone: true, role: true,
                avatarUrl: true, idType: true, idNumber: true, address: true,
                province: true, city: true, birthDate: true, citizenship: true, createdAt: true,
            },
        });
    }

    async registerHost(dto: RegisterHostDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw new ConflictException('Email already exists');

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: hashedPassword,
                role: 'HOST',
                organizerProfile: {
                    create: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        identificationNumber: dto.identificationNumber,
                        phone: dto.phone,
                        organizationName: dto.organizationName,
                        organizationDescription: dto.organizationDescription,
                        organizationLogo: dto.organizationLogo,
                        address: dto.address,
                        province: dto.province,
                        city: dto.city,
                        plan: dto.plan || 'FREE',
                        status: 'PENDING',
                    },
                },
            },
            include: { organizerProfile: true },
        });
        const { password, ...result } = user;
        const payload = { email: result.email, sub: result.id, role: result.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: result,
        };
    }
}
