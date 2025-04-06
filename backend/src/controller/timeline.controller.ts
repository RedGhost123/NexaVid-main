import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { TimelineService } from '../services/timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post('save')
  async saveTimeline(@Body() timelineData: any) {
    return await this.timelineService.saveTimeline(timelineData);
  }

  @Get(':projectId')
  async getTimeline(@Param('projectId') projectId: string) {
    return await this.timelineService.getTimeline(projectId);
  }

  @Patch('undo/:projectId')
  async undoLastEdit(@Param('projectId') projectId: string) {
    return await this.timelineService.undoLastEdit(projectId);
  }

  @Patch('redo/:projectId')
  async redoLastEdit(@Param('projectId') projectId: string) {
    return await this.timelineService.redoLastEdit(projectId);
  }
}
