// src/videos/video.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('videos')
export class VideoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  videoUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
