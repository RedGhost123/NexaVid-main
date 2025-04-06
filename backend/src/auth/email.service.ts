import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  // ✅ Send OTP Email
  async sendOtp(email: string, otp: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
    });
  }

  // ✅ Send Password Reset Email
  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: "Password Reset Request",
      text: `Click the following link to reset your password: ${resetLink}. This link will expire in 30 minutes.`,
    });
  }

  // ✅ Send Suspicious Login Alert
  async sendSuspiciousLoginAlert(email: string, location: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: "Suspicious Login Attempt Detected",
      text: `A login attempt was detected from ${location}. If this was not you, please secure your account immediately.`,
    });
  }

  // ✅ Send Account Locked Email
  async sendAccountLockedEmail(email: string, message: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: "Account Locked",
      text: message,
    });
  }

  // ✅ Send Account Unlock Email
  async sendAccountUnlockEmail(email: string, subject: string, message: string) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      text: message,
    });
  }
}
