import { Injectable, UnauthorizedException, ConflictException, NotFoundException, ForbiddenException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto, RegisterHostDto, UpdateProfileDto, UpdateBasicInfoDto, UpdateOrganizerProfileInfoDto } from '@open-ticket/shared';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 10 * 60; // 10 minutos

const MAX_IP_ATTEMPTS = 20;
const IP_LOCKOUT_SECONDS = 15 * 60; // 15 minutos

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mail: MailService,
        private redis: RedisService,
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

    private attemptsKey(email: string) {
        return `login:attempts:${email.toLowerCase()}`;
    }

    private async checkLoginLock(email: string) {
        const key = this.attemptsKey(email);
        const attempts = parseInt((await this.redis.get(key)) || '0', 10);
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            const remaining = await this.redis.ttl(key);
            const mins = Math.ceil(remaining / 60);
            throw new HttpException(
                `Demasiados intentos fallidos. Por seguridad, intenta de nuevo en ${mins} minuto${mins !== 1 ? 's' : ''}.`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    private async recordFailedAttempt(email: string) {
        const key = this.attemptsKey(email);
        const count = await this.redis.incr(key);
        if (count === 1) {
            // Primer intento fallido: establece el TTL de 10 min
            await this.redis.expire(key, LOCKOUT_SECONDS);
        }
        const remaining = MAX_LOGIN_ATTEMPTS - count;
        if (remaining <= 0) {
            const mins = Math.ceil(LOCKOUT_SECONDS / 60);
            throw new HttpException(
                `Demasiados intentos fallidos. Por seguridad, intenta de nuevo en ${mins} minuto${mins !== 1 ? 's' : ''}.`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
        throw new UnauthorizedException(
            `Credenciales inválidas. Te quedan ${remaining} intento${remaining !== 1 ? 's' : ''}.`,
        );
    }

    private async clearLoginAttempts(email: string) {
        await this.redis.del(this.attemptsKey(email));
    }

    private ipKey(ip: string) {
        return `ip:failed:${ip}`;
    }

    private async checkIpLock(ip: string) {
        if (ip === 'unknown') return;
        const attempts = parseInt((await this.redis.get(this.ipKey(ip))) || '0', 10);
        if (attempts >= MAX_IP_ATTEMPTS) {
            const remaining = await this.redis.ttl(this.ipKey(ip));
            const mins = Math.ceil(remaining / 60);
            throw new HttpException(
                `Demasiadas solicitudes desde tu red. Intenta de nuevo en ${mins} minuto${mins !== 1 ? 's' : ''}.`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    private async recordIpFailedAttempt(ip: string) {
        if (ip === 'unknown') return;
        const key = this.ipKey(ip);
        const count = await this.redis.incr(key);
        if (count === 1) {
            await this.redis.expire(key, IP_LOCKOUT_SECONDS);
        }
    }

    async login(loginDto: LoginDto, ip = 'unknown') {
        const email = loginDto.email.toLowerCase();

        await this.checkIpLock(ip);
        await this.checkLoginLock(email);

        // Buscar el email en ambas tablas antes de comparar contraseña
        const [userRecord, memberRecord] = await Promise.all([
            this.prisma.user.findUnique({ where: { email }, include: { organizerProfile: true } }),
            this.prisma.organizerMember.findUnique({ where: { email }, include: { organizerProfile: true } }),
        ]);

        if (!userRecord && !memberRecord) {
            await this.recordIpFailedAttempt(ip);
            throw new NotFoundException('No existe una cuenta asociada a este correo electrónico.');
        }

        // Intentar login como User
        if (userRecord && (await bcrypt.compare(loginDto.password, userRecord.password))) {
            if (!userRecord.emailVerified) {
                throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
            }
            if (userRecord.isBlocked) {
                throw new UnauthorizedException('Tu cuenta ha sido suspendida. Contacta a soporte para más información.');
            }
            if (userRecord.role === 'HOST' && userRecord.organizerProfile?.status === 'PENDING') {
                throw new UnauthorizedException('Tu cuenta de organizador aún está en revisión. Te notificaremos cuando sea aprobada.');
            }
            if (userRecord.role === 'HOST' && userRecord.organizerProfile?.status === 'REJECTED') {
                throw new UnauthorizedException('Tu solicitud de cuenta de organizador fue rechazada. Contacta a soporte para más detalles.');
            }
            if (userRecord.role === 'HOST' && userRecord.organizerProfile?.status === 'BLOCKED') {
                throw new UnauthorizedException('Tu cuenta ha sido suspendida. Contacta a soporte para más información.');
            }
            await this.clearLoginAttempts(email);
            const { password, ...result } = userRecord;
            const payload = {
                email: result.email,
                sub: result.id,
                role: result.role,
                organizerProfileId: result.organizerProfile?.id ?? null,
            };
            return { access_token: this.jwtService.sign(payload), user: result };
        }

        // Intentar login como OrganizerMember
        if (memberRecord && (await bcrypt.compare(loginDto.password, memberRecord.password))) {
            await this.clearLoginAttempts(email);
            const payload = {
                sub: memberRecord.id,
                email: memberRecord.email,
                role: 'HOST',
                isMember: true,
                memberRole: memberRecord.memberRole,
                organizerProfileId: memberRecord.organizerProfileId,
            };
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: memberRecord.id,
                    email: memberRecord.email,
                    name: memberRecord.name,
                    role: 'HOST',
                    isMember: true,
                    memberRole: memberRecord.memberRole,
                    organizerProfileId: memberRecord.organizerProfileId,
                    organizerProfile: memberRecord.organizerProfile,
                },
            };
        }

        // El email existe pero la contraseña es incorrecta
        await this.recordIpFailedAttempt(ip);
        await this.recordFailedAttempt(email);
    }

    async register(registerDto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: registerDto.email } });
        if (existing) throw new ConflictException('Este correo electrónico ya está registrado. Por favor, inicia sesión o usa un correo diferente.');

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const emailVerifyToken = crypto.randomBytes(32).toString('hex');
        const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        const user = await this.prisma.user.create({
            data: {
                ...registerDto,
                password: hashedPassword,
                emailVerified: false,
                emailVerifyToken,
                emailVerifyExpires,
            },
        });
        const { password, ...result } = user;
        this.mail.sendWelcomeUser(result.email, result.name).catch(() => null);
        this.mail.sendEmailVerification(result.email, result.name, emailVerifyToken).catch(() => null);
        return { message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.' };
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

    async getOrganizerFullProfile(userId: string, isMember: boolean) {
        if (isMember) {
            const member = await this.prisma.organizerMember.findUnique({ where: { id: userId } });
            if (!member) throw new NotFoundException('Miembro no encontrado');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _mp, ...safeMember } = member;
            return { type: 'member', member: safeMember };
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organizerProfile: true },
        });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _up, ...safeUser } = user;
        return { type: 'host', user: safeUser };
    }

    async updateBasicInfo(userId: string, isMember: boolean, dto: UpdateBasicInfoDto) {
        if (isMember) {
            return this.prisma.organizerMember.update({
                where: { id: userId },
                data: {
                    ...(dto.name && { name: dto.name }),
                    ...(dto.phone !== undefined && { phone: dto.phone || null }),
                    ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl || null }),
                },
                select: { id: true, name: true, email: true, phone: true, avatarUrl: true, memberRole: true },
            });
        }
        const data: Record<string, unknown> = {};
        if (dto.name) data['name'] = dto.name;
        if (dto.phone !== undefined) data['phone'] = dto.phone || null;
        if (dto.email) {
            const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
            if (existing && existing.id !== userId) throw new ConflictException('El email ya está en uso');
            data['email'] = dto.email;
        }
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true },
        });
    }

    async changePassword(userId: string, isMember: boolean, currentPassword: string, newPassword: string) {
        if (isMember) {
            const member = await this.prisma.organizerMember.findUnique({ where: { id: userId } });
            if (!member) throw new NotFoundException('Miembro no encontrado');
            if (!(await bcrypt.compare(currentPassword, member.password)))
                throw new UnauthorizedException('La contraseña actual es incorrecta');
            await this.prisma.organizerMember.update({
                where: { id: userId },
                data: { password: await bcrypt.hash(newPassword, 10) },
            });
        } else {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user) throw new NotFoundException('Usuario no encontrado');
            if (!(await bcrypt.compare(currentPassword, user.password)))
                throw new UnauthorizedException('La contraseña actual es incorrecta');
            await this.prisma.user.update({
                where: { id: userId },
                data: { password: await bcrypt.hash(newPassword, 10) },
            });
        }
        if (isMember) {
            const m = await this.prisma.organizerMember.findUnique({ where: { id: userId } });
            if (m) this.mail.sendPasswordChanged(m.email, m.name).catch(() => null);
        } else {
            const u = await this.prisma.user.findUnique({ where: { id: userId } });
            if (u) this.mail.sendPasswordChanged(u.email, u.name).catch(() => null);
        }
        return { message: 'Contraseña actualizada correctamente' };
    }

    async updateOrganizerProfileInfo(userId: string, dto: UpdateOrganizerProfileInfoDto) {
        const profile = await this.prisma.organizerProfile.findUnique({ where: { userId } });
        if (!profile) throw new NotFoundException('Perfil de organizador no encontrado');
        return this.prisma.organizerProfile.update({
            where: { userId },
            data: {
                ...(dto.organizationName && { organizationName: dto.organizationName }),
                ...(dto.organizationDescription !== undefined && { organizationDescription: dto.organizationDescription }),
                ...(dto.organizationLogo !== undefined && { organizationLogo: dto.organizationLogo || null }),
                ...(dto.address !== undefined && { address: dto.address }),
                ...(dto.province !== undefined && { province: dto.province }),
                ...(dto.city !== undefined && { city: dto.city }),
            },
            select: {
                id: true, organizationName: true, organizationDescription: true,
                organizationLogo: true, address: true, province: true, city: true,
                firstName: true, lastName: true, identificationNumber: true, phone: true,
                plan: true, status: true,
            },
        });
    }

    async registerHost(dto: RegisterHostDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw new ConflictException('Este correo electrónico ya está registrado. Por favor, inicia sesión o usa un correo diferente.');

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

        if (dto.organizationLogo) {
            const tempIdMatch = dto.organizationLogo.match(/\/uploads\/organizers\/([^/]+)\//);
            const tempId = tempIdMatch ? tempIdMatch[1] : null;

            if (tempId && tempId !== user.id) {
                const fs = require('fs');
                const tempLogoDir = `./uploads/organizers/${tempId}/logo`;
                const newLogoDir = `./uploads/organizers/${user.id}/logo`;

                if (fs.existsSync(tempLogoDir)) {
                    try {
                        fs.mkdirSync(newLogoDir, { recursive: true });
                        for (const filename of fs.readdirSync(tempLogoDir)) {
                            fs.copyFileSync(`${tempLogoDir}/${filename}`, `${newLogoDir}/${filename}`);
                        }
                        const newLogoUrl = dto.organizationLogo.replace(
                            `/organizers/${tempId}/`,
                            `/organizers/${user.id}/`
                        );
                        await this.prisma.organizerProfile.update({
                            where: { userId: user.id },
                            data: { organizationLogo: newLogoUrl }
                        });
                        if (user.organizerProfile) {
                            user.organizerProfile.organizationLogo = newLogoUrl;
                        }
                        try {
                            fs.rmSync(`./uploads/organizers/${tempId}`, { recursive: true, force: true });
                        } catch { /* ignore cleanup errors */ }
                    } catch (e) {
                        console.error('Failed to migrate logo directory', e);
                    }
                }
            }
        }

        const { password, ...result } = user;
        const payload = { email: result.email, sub: result.id, role: result.role };
        this.mail.sendWelcomeHost(
            result.email,
            result.name,
            result.organizerProfile?.organizationName || result.name,
        ).catch(() => null);
        return {
            access_token: this.jwtService.sign(payload),
            user: result,
        };
    }

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findUnique({ where: { emailVerifyToken: token } });
        if (!user) throw new BadRequestException('El enlace de verificación no es válido.');
        if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) {
            throw new BadRequestException('El enlace de verificación ha expirado. Solicita uno nuevo.');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpires: null },
        });
        return { message: '¡Correo verificado! Ya puedes iniciar sesión.' };
    }

    async resendVerification(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        // Always return success to avoid email enumeration
        if (!user || user.emailVerified) {
            return { message: 'Si existe una cuenta pendiente de verificación, recibirás un nuevo correo.' };
        }
        const token = crypto.randomBytes(32).toString('hex');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerifyToken: token, emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        });
        this.mail.sendEmailVerification(user.email, user.name, token).catch(() => null);
        return { message: 'Si existe una cuenta pendiente de verificación, recibirás un nuevo correo.' };
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        // Always return success to avoid email enumeration
        if (user) {
            const token = crypto.randomBytes(32).toString('hex');
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordToken: token,
                    resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1h
                },
            });
            this.mail.sendPasswordReset(user.email, user.name, token).catch(() => null);
        }
        return { message: 'Si existe una cuenta con ese correo, recibirás instrucciones para restablecer tu contraseña.' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({ where: { resetPasswordToken: token } });
        if (!user) throw new BadRequestException('El enlace de recuperación no es válido.');
        if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
            throw new BadRequestException('El enlace de recuperación ha expirado. Solicita uno nuevo.');
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashed, resetPasswordToken: null, resetPasswordExpires: null },
        });
        return { message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' };
    }
}
