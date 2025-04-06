import { Injectable, BadRequestException } from "@nestjs/common";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class TwoFactorService {
  constructor(private prisma: PrismaService) {}

  // ✅ Generate 2FA Secret
  async generateTwoFactorSecret(userId: string) {
    const secret = speakeasy.generateSecret({ name: `NexaVid (${userId})` });

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    return { secret: secret.base32, qrCodeUrl };
  }

  // ✅ Enable 2FA
  async enableTwoFactor(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { message: "2FA Enabled" };
  }

  // ✅ Verify 2FA Token
  async verifyTwoFactorToken(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException("2FA is not set up");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!isValid) throw new BadRequestException("Invalid OTP");

    return { message: "2FA verification successful!" };
  }
}
