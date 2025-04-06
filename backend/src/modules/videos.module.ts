// src/videos/videos.module.ts
import { Module } from '@nestjs/common';
import { VideosController } from '../controller/videos.controller';
import { VideosService } from '../services/videos.service';
import { FirebaseService } from '../services/firebase.service';
import { PrismaService } from '../../prisma/prisma.service'; // Make sure prisma is set up

@Module({
  controllers: [VideosController],
  providers: [VideosService, FirebaseService, PrismaService],
})
export class VideosModule {}
