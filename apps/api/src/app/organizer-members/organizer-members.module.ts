import { Module } from '@nestjs/common';
import { OrganizerMembersController } from './organizer-members.controller';
import { OrganizerMembersService } from './organizer-members.service';

@Module({
    controllers: [OrganizerMembersController],
    providers: [OrganizerMembersService],
})
export class OrganizerMembersModule {}
