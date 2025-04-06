import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import * as geoip from "geoip-lite";
import { EmailService } from "src/auth/email.service"; // ✅ Correct import

@Injectable()
export class SecurityService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService // ✅ Inject EmailService
  ) {}

  async detectSuspiciousLogin(userId: string, ip: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const geo = geoip.lookup(ip);
    const location = geo ? `${geo.city}, ${geo.country}` : "Unknown";

    // If user's last login location was different, send alert
    if (user.lastLoginLocation && user.lastLoginLocation !== location) {
      await this.emailService.sendSuspiciousLoginAlert(
        user.email,
        location // ✅ Correct parameter
      );
    }
  }
}
