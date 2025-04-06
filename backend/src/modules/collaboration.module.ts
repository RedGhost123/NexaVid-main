import { Module } from '@nestjs/common';
import { CollaborationGateway } from '../gateways/collaboration.gateway';
import { CollaborationService } from '../services/collaboration.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [CollaborationGateway, CollaborationService, PrismaService],
})
export class CollaborationModule {}
