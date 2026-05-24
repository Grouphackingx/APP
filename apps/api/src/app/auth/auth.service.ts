import { Injectable, UnauthorizedException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto, RegisterHostDto, UpdateProfileDto, UpdateBasicInfoDto, UpdateOrganizerProfileInfoDto } from '@open-ticket/shared';
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

        if (user) {
            if (user.role === 'HOST' && user.organizerProfile?.status === 'PENDING') {
                throw new UnauthorizedException('Tu cuenta de organizador aún está en revisión. Te notificaremos cuando sea aprobada.');
            }
            if (user.role === 'HOST' && user.organizerProfile?.status === 'REJECTED') {
                throw new UnauthorizedException('Tu solicitud de cuenta de organizador fue rechazada. Contacta a soporte para más detalles.');
            }
            const payload = {
                email: user.email,
                sub: user.id,
                role: user.role,
                organizerProfileId: user.organizerProfile?.id ?? null,
            };
            return { access_token: this.jwtService.sign(payload), user };
        }

        // Intentar como miembro de organización
        const member = await this.prisma.organizerMember.findUnique({
            where: { email: loginDto.email },
            include: { organizerProfile: true },
        });
        if (!member || !(await bcrypt.compare(loginDto.password, member.password))) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = {
            sub: member.id,
            email: member.email,
            role: 'HOST',
            isMember: true,
            memberRole: member.memberRole,
            organizerProfileId: member.organizerProfileId,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: member.id,
                email: member.email,
                name: member.name,
                role: 'HOST',
                isMember: true,
                memberRole: member.memberRole,
                organizerProfileId: member.organizerProfileId,
                organizerProfile: member.organizerProfile,
            },
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
        return {
            access_token: this.jwtService.sign(payload),
            user: result,
        };
    }
}
