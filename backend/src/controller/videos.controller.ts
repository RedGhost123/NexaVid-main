// src/videos/videos.controller.ts
import {
  Controller, Post, UseInterceptors, UploadedFile,
  Body, Get, Res, Put, Delete, UploadedFiles, Req, UseGuards, Param, Query, HttpException, HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateVideoDto } from '../dto/create-video.dto';
import { VideosService } from '../services/videos.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { AuthGuard } from '@nestjs/passport';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @Body() body: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new HttpException('No video file uploaded', HttpStatus.BAD_REQUEST);
    }
    const result = await this.videosService.uploadToFirebase(body, file);
    return result;
  }
  @Get()
  async getAllVideos() {
    return this.videosService.getAllVideos();
  }

  @Put(':id')
  async updateVideo(@Param('id') id: string, @Body() data: { title: string }) {
    return this.videosService.updateVideo(id, data.title);
   }
  // @Delete(':id')
  // async deleteVideo(@Param('id') id: string) {
  //   return this.videosService.deleteVideo(id);
  // }

  @Delete('/:id')
async deleteVideo(@Param('id') id: string, @Req() req) {
  const user = await this.userService.findById(req.user.id);
  return this.videosService.deleteVideo(id, user.id);
}

  @Get()
  @UseGuards(AuthGuard)
  async getVideos(
    @Req() req,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("sort") sort?: string
  ) {
    const userId = req.user.id;
    return this.videosService.getFilteredVideos(userId, search, status, sort);
  }
  
  @Get('/')
async getUserVideos(@Req() req) {
  const user = await this.userService.findById(req.user.id);
  const videos = await this.videoService.getVideosByUser(user.id);
  return videos;
}


}
