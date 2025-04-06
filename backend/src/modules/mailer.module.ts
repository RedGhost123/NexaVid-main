import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EmailService } from "./email.service";

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          service: "gmail",
          auth: {
            user: config.get("EMAIL_USER"),
            pass: config.get("EMAIL_PASS"),
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService], // So other modules can use EmailService
})
export class MailerCustomModule {}
