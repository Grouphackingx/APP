import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'secretKey',
        });
    }

    async validate(payload: any) {
        if (payload.role === 'HOST' && !payload.isMember && payload.sub) {
            const profile = await this.prisma.organizerProfile.findUnique({
                where: { userId: payload.sub },
                select: { status: true },
            });
            if (profile?.status === 'BLOCKED') {
                throw new UnauthorizedException('ACCOUNT_BLOCKED');
            }
        }

        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            isMember: payload.isMember ?? false,
            memberRole: payload.memberRole ?? null,
            organizerProfileId: payload.organizerProfileId ?? null,
        };
    }
}
