import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVideoDto } from 'src/dto/create-video.dto';
import { storage } from '../entities/firebase';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VideosService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadToFirebase(
    body: CreateVideoDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(__dirname, '../../uploads', filename);

    try {
      // Save temporarily
      fs.writeFileSync(filepath, file.buffer);

      // Upload to Firebase Storage
      await storage.upload(filepath, {
        destination: `videos/${filename}`,
        metadata: {
          contentType: file.mimetype,
        },
      });

      fs.unlinkSync(filepath); // delete after upload

      const videoURL = `https://storage.googleapis.com/${storage.name}/videos/${filename}`;

      const newVideo = await this.prisma.video.create({
        data: {
          title: body.title,
          description: body.description || '',
          videoUrl: videoURL,
          status: 'processing',
          userId,
        },
      });

      return {
        success: true,
        projectId: newVideo.id,
        downloadURL: videoURL,
      };
    } catch (error) {
      throw new InternalServerErrorException('Upload failed');
    }
  }

  async getAllVideos() {
    return this.prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateVideo(id: string, title: string) {
    return this.prisma.video.update({
      where: { id },
      data: { title },
    });
  }

  async deleteVideo(videoId: string, userId: string) {
    const video = await this.prisma.video.findFirst({
      where: { id: videoId, userId },
    });

    if (!video) throw new NotFoundException('Video not found');

    const storagePath = video.videoUrl.split(`/${storage.name}/`)[1];

    await storage.file(storagePath).delete();

    await this.prisma.video.delete({
      where: { id: videoId },
    });

    return { message: 'Video deleted successfully' };
  }

  async createVideo(title: string, videoUrl: string) {
    return this.prisma.video.create({
      data: {
        title,
        videoUrl,
        status: 'pending',
      },
    });
  }

  async updateVideoStatus(id: string, status: string) {
    return this.prisma.video.update({
      where: { id },
      data: { status },
    });
  }

  async startProcessing(id: string) {
    await this.updateVideoStatus(id, 'processing');

    setTimeout(async () => {
      await this.updateVideoStatus(id, 'completed');
    }, 10000);
  }

  async getFilteredVideos(
    userId: string,
    search?: string,
    status?: string,
    sort?: 'oldest' | 'newest',
  ) {
    return this.prisma.video.findMany({
      where: {
        userId,
        AND: [
          search ? { title: { contains: search, mode: 'insensitive' } } : {},
          status ? { status } : {},
        ],
      },
      orderBy: sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' },
    });
  }

  async processVideo(userId: string, videoId: string, effect: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.credits < 5) {
      throw new Error('Not enough credits!');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 5 } },
    });

    // TODO: Trigger external AI effect processing via model API

    await this.updateVideoStatus(videoId, 'processing');

    return { message: 'AI effect processing started!' };
  }
}
