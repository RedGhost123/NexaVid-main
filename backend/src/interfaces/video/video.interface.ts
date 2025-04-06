export interface Video {
    id: string;
    title: string;
    description?: string;
    videoUrl: string;
    status: 'pending' | 'processing' | 'completed';
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }
  