import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OrganizerMembersService {
    constructor(private prisma: PrismaService) {}

    private async getProfileOrFail(userId: string) {
        const profile = await this.prisma.organizerProfile.findUnique({ where: { userId } });
        if (!profile) throw new NotFoundException('Perfil de organizador no encontrado');
        return profile;
    }

    async getMembers(userId: string) {
        const profile = await this.getProfileOrFail(userId);
        return this.prisma.organizerMember.findMany({
            where: { organizerProfileId: profile.id },
            select: { id: true, name: true, email: true, phone: true, avatarUrl: true, memberRole: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
    }

    async createMember(userId: string, data: { name: string; email: string; phone?: string; avatarUrl?: string; password: string; memberRole: 'ADMIN' | 'STAFF' }) {
        const profile = await this.getProfileOrFail(userId);

        const existing = await this.prisma.organizerMember.findUnique({ where: { email: data.email } });
        if (existing) throw new ConflictException('Este email ya está registrado');

        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.organizerMember.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone ?? null,
                avatarUrl: data.avatarUrl ?? null,
                password: hashedPassword,
                memberRole: data.memberRole,
                organizerProfileId: profile.id,
            },
            select: { id: true, name: true, email: true, phone: true, avatarUrl: true, memberRole: true, createdAt: true },
        });
    }

    async updateMember(userId: string, memberId: string, data: { name?: string; phone?: string; avatarUrl?: string; memberRole?: 'ADMIN' | 'STAFF'; password?: string }) {
        const member = await this.prisma.organizerMember.findUnique({
            where: { id: memberId },
            include: { organizerProfile: true },
        });
        if (!member || member.organizerProfile.userId !== userId) throw new NotFoundException('Miembro no encontrado');

        const updateData: Record<string, unknown> = {};
        if (data.name) updateData['name'] = data.name;
        if (data.phone !== undefined) updateData['phone'] = data.phone || null;
        if (data.avatarUrl !== undefined) updateData['avatarUrl'] = data.avatarUrl || null;
        if (data.memberRole) updateData['memberRole'] = data.memberRole;
        if (data.password) updateData['password'] = await bcrypt.hash(data.password, 10);

        return this.prisma.organizerMember.update({
            where: { id: memberId },
            data: updateData,
            select: { id: true, name: true, email: true, phone: true, avatarUrl: true, memberRole: true, createdAt: true },
        });
    }

    async deleteMember(userId: string, memberId: string) {
        const member = await this.prisma.organizerMember.findUnique({
            where: { id: memberId },
            include: { organizerProfile: true },
        });
        if (!member || member.organizerProfile.userId !== userId) throw new NotFoundException('Miembro no encontrado');
        await this.prisma.organizerMember.delete({ where: { id: memberId } });
        return { message: 'Usuario eliminado correctamente' };
    }
}
