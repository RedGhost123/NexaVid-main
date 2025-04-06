import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException, 
  ForbiddenException 
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import * as geoip from "geoip-lite";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import * as crypto from "crypto";
import { EmailService } from "../auth/email.service";// Import EmailService
import { Request } from "express";




@Injectable()
export class AuthService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private LOCK_DURATION_MINUTES = 15; // Lock duration before auto-unlock

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService // ✅ Add this
  ) {}

  // ✅ Feature 1: User Registration
  async register(fullName: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { fullName, email, password: hashedPassword },
    });

    return this.generateTokens(user);
  }

  // ✅ Feature 2: User Login (with failed attempt tracking)
  async login(email: string, password: string, ip: string, req: Request, otp?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException("Invalid credentials");
  
    // ✅ Feature 10: Account Locking (After 5 Failed Attempts)
    if (user.isLocked) {
      if (user.unlockTime && new Date() > user.unlockTime) {
        // Auto-unlock account after cooldown
        await this.prisma.user.update({
          where: { email },
          data: { isLocked: false, failedLoginAttempts: 0 },
        });
      } else {
        throw new ForbiddenException("Account is locked. Try again later.");
      }
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await this.trackFailedLogin(user);
      throw new UnauthorizedException("Invalid credentials");
    }
  
    // ✅ Feature 12: Reset failed attempts on successful login
    await this.prisma.user.update({
      where: { email },
      data: { failedLoginAttempts: 0, isLocked: false },
    });
  
    // ✅ Feature 14: Login IP & Location Logging
    const geo = geoip.lookup(ip);
    await this.prisma.user.update({
      where: { email },
      data: { lastLoginIp: ip, lastLoginLocation: geo ? `${geo.city}, ${geo.country}` : "Unknown" },
    });
  
    // ✅ Feature 15-16: Suspicious Login Detection
    await this.detectSuspiciousLogin(user, ip);
  
    // ✅ Feature 21: Require OTP if 2FA is enabled
    if (user.twoFactorEnabled) {
      if (!otp) throw new UnauthorizedException("OTP required for 2FA");
      const isOtpValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: otp,
      });
      if (!isOtpValid) throw new UnauthorizedException("Invalid OTP");
    }
  
    // ✅ Log Login Session
    await this.logSession(user.id, req);
  
    // ✅ Return Tokens
    return this.generateTokens(user);
  }

  // logsession

  async logSession(userId: string, req: Request) {
    const userAgent = req.headers["user-agent"] || "Unknown";
     const ip = req.headers["x-forwarded-for"] as string || (req as any).socket?.remoteAddress || "Unknown";
    

  
    await this.prisma.session.create({
      data: {
        userId,
        ip,
        userAgent,
        timestamp: new Date(),
      },
    });
  
    console.log(`Logged session for user ${userId} from IP: ${ip}`);
  }
  
  
  // ✅ Feature 3: Logout (Clears Refresh Token)
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: "Logged out successfully" };
  }

  // ✅ Feature 4-5: OAuth Login (Google, Facebook, etc.)
  async validateOAuthLogin(profile: any, provider: string) {
    const email = profile.emails[0]?.value;
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          fullName: profile.displayName,
          email,
          provider,
          providerId: profile.id,
        },
      });
    }

    return this.generateTokens(user);
  }
// ✅ Feature 6-9: JWT & Token Management
async generateTokens(user: any) {
  const accessToken = this.generateJwt(user.id, user.email);
  const refreshToken = this.jwtService.sign(
    { userId: user.id },
    { expiresIn: "7d" }
  );

  await this.updateRefreshToken(user.id, refreshToken);
  return { accessToken, refreshToken };
}

generateJwt(userId: string, email: string) {
  return this.jwtService.sign(
    { userId, email },
    { expiresIn: "15m" }
  );
}


// ✅ NEW: Add the Password Reset Function BELOW the existing ones
async requestPasswordReset(email: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  // Generate Reset Token (expires in 30 mins)
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

  await this.prisma.user.update({
    where: { email },
    data: { resetToken, resetTokenExpires },
  });

  // ✅ Reuse emailService to send password reset email
  await this.emailService.sendPasswordResetEmail(
    email,
    "Password Reset Request",
    `Your password reset token is: ${resetToken}`
  );

  return { message: "Password reset email sent" };
}



// ✅ Securely Hash and Store Refresh Token
async updateRefreshToken(userId: string, refreshToken: string) {
  const hashedToken = await bcrypt.hash(refreshToken, 10);
  await this.prisma.user.update({
    where: { id: userId },
    data: { refreshToken: hashedToken },
  });
}

// ✅ Securely Validate Refresh Token
async refreshTokens(refreshToken: string) {
  try {
    const payload = this.jwtService.verify(refreshToken); // 🔓 Decode userId from token
    const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || !user.refreshToken) throw new UnauthorizedException("Access Denied");

    const tokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenValid) throw new UnauthorizedException("Access Denied");

    return this.generateTokens(user); // 🔄 Issue new tokens
  } catch (error) {
    throw new UnauthorizedException("Invalid Refresh Token");
  }
}



  // ✅ Feature 17-18: Detect Suspicious Login & Track IP
  async detectSuspiciousLogin(user: any, ip: string) {
    const geo = geoip.lookup(ip);
    const location = geo ? `${geo.city}, ${geo.country}` : "Unknown";
  
    // Check last login location
    if (user.lastLoginIp && user.lastLoginIp !== ip) {
      // 🚨 Send Email Notification
      await this.emailService.sendSuspiciousLoginAlert(user.email, location);
      console.log(`Suspicious login detected for user ${user.email} from IP: ${ip}`);
    }
  }

  // trackfield

  async trackFailedLogin(user: any) {
    const failedAttempts = user.failedLoginAttempts + 1; // ✅ Correct reference
    let isLocked = false;
    let unlockTime: Date | null = null;
  
    if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      isLocked = true;
      unlockTime = new Date(Date.now() + this.LOCK_DURATION_MINUTES * 60 * 1000);
  
      // 🚨 Send an email when the account is locked
      await this.emailService.sendAccountLockedEmail(
        user.email,
        "⚠️ Your account has been locked due to multiple failed login attempts. Try again in 15 minutes."
      );
    }
  
    await this.prisma.user.update({
      where: { email: user.email },
      data: { failedLoginAttempts: failedAttempts, isLocked, unlockTime },
    });
  }
  //API to Fetch Active Sessions
  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      select: {
        id: true,          // ✅ Explicitly define each field
        ipAddress: true,
        device: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async updateSubscription(userId: string, plan: SubscriptionType) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { subscription: plan },
    });
  }
  

  async getUserInfo(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { email, credits, subscription },
    });
  }
  
  
  
  //API to Revoke a Session
  async revokeSession(userId: string, sessionId: string) {
    return this.prisma.session.deleteMany({ where: { id: sessionId, userId } });
  }
// Logout: Revoke All Sessions
async revokeAllSessions(userId: string) {
  await this.prisma.session.deleteMany({ where: { userId } });
}



  // ✅ Feature 22-26: OTP Verification via Email
  async sendOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error("User not found");

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: { otpCode: otp, otpExpires },
    });

    await this.emailService.sendOtp(email, otp);
    return { message: "OTP sent to your email" };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.otpCode || !user.otpExpires || new Date() > user.otpExpires) {
      throw new Error("Invalid or expired OTP");
    }

    if (user.otpCode !== otp) {
      throw new Error("Invalid OTP");
    }

    await this.prisma.user.update({
      where: { email },
      data: { otpCode: null, otpExpires: null },
    });

    return this.generateTokens(user);
  }

  // ✅ Feature 11: Account Unlock API
  async unlockAccount(email: string) {
    await this.prisma.user.update({
      where: { email },
      data: { isLocked: false, failedLoginAttempts: 0 },
    });

    return { message: "Account unlocked successfully" };
  }


  //Implement Account Recovery (Unlock Suspended Accounts)

  
  // 📨 Generate Unlock Token and Send Email
  async requestAccountUnlock(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    if (!user.isLocked) {
      throw new Error("Your account is not locked.");
    }

    // Generate Unlock Token (expires in 30 mins)
    const unlockToken = crypto.randomBytes(32).toString("hex");
    const unlockTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: { unlockToken, unlockTokenExpires },
    });

    const unlockLink = `https://yourapp.com/unlock-account?token=${unlockToken}`;
    
    await this.emailService.sendAccountUnlockEmail(
      email, 
      "Unlock Your Account", 
      `Click the link below to unlock your account:\n${unlockLink}\n\nThis link expires in 30 minutes.`
    );

    return { message: "Account unlock email sent" };
  }

  // 🔓 Verify Unlock Token and Unlock Account
  async unlockAccountWithToken(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { unlockToken: token, unlockTokenExpires: { gt: new Date() } },
    });

    if (!user) throw new Error("Invalid or expired unlock token");

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        isLocked: false, 
        failedLoginAttempts: 0, 
        unlockToken: null, 
        unlockTokenExpires: null 
      },
    });

    return { message: "Your account has been successfully unlocked. You can now log in." };
  }
}

