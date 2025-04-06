import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { MailerCustomModule } from "./mailer.module";// ✅ Ensure this module exists
import { PrismaModule } from "prisma/prisma.module"; // ✅ Import PrismaModule
import { VideosModule } from "./videos.module";

@Module({
  imports: [
    VideosModule,
    PrismaModule,
    ConfigModule.forRoot(), // ✅ Load environment variables
    ThrottlerModule.forRoot({
      ttl: 15 * 60, // ⏳ 15 minutes
      limit: 5, // ⛔ Max 5 login attempts per 15 minutes
    }),
    AuthModule, // ✅ Authentication module
    MailerCustomModule, // ✅ Mailer module
  ],
})
export class AppModule {}


import { CallModule } from './call/call.module';

@Module({
  imports: [CallModule],
})
export class AppModule {}
