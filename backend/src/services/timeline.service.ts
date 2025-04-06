import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineDto } from './dto/timeline.dto';

@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async saveTimeline(timelineData: TimelineDto) {
    return this.prisma.timeline.upsert({
      where: { projectId: timelineData.projectId },
      update: { edits: timelineData.edits },
      create: {
        projectId: timelineData.projectId,
        edits: timelineData.edits,
      },
    });
  }

  async getTimeline(projectId: string) {
    const timeline = await this.prisma.timeline.findUnique({
      where: { projectId },
    });

    if (!timeline) {
      throw new NotFoundException(`Timeline not found for project: ${projectId}`);
    }

    return timeline;
  }

  async undoLastEdit(projectId: string) {
    const timeline = await this.getTimeline(projectId);

    if (!timeline.edits || timeline.edits.length === 0) {
      throw new NotFoundException('No edits to undo');
    }

    const updatedEdits = [...timeline.edits];
    updatedEdits.pop();

    return this.saveTimeline({ projectId, edits: updatedEdits });
  }

  async redoLastEdit(projectId: string) {
    // TODO: Add redo stack in future implementation
    return { message: 'Redo functionality coming soon!' };
  }
}
