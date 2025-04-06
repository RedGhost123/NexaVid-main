import { Controller, Post, Get, Res, Body, Req, UseGuards, Param, Query } from "@nestjs/common";
import { AuthService } from "src/services/authservices";
import { PasswordService } from "src/passwordresetservices/password.services";
import { TwoFactorService } from "src/auth/twofactor.service";
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { GoogleAuthGuard, FacebookAuthGuard, TwitterAuthGuard, LinkedInAuthGuard } from "src/auth/auth.guard";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import { UnauthorizedException } from "@nestjs/common";
import { Delete } from "@nestjs/common";
import rateLimit from "express-rate-limit";


// ✅ Ensure DTO is properly imported
class LoginDto {
  email: string;
  password: string;
  otp?: string;
}

interface AuthenticatedUser {
  userId: string;
}


@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private passwordService: PasswordService,
  ) { }

  // 1️⃣ User Authentication
  @Post("register")
  async register(@Body() body: { fullName: string; email: string; password: string }) {
    return this.authService.register(body.fullName, body.email, body.password);
  }
  @Post("login")
  @Throttle(5, 15 * 60) // ⏳ Max 5 requests per 900 seconds (15 minutes)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    // Handle 2FA OTP if enabled
    if (user.twoFactorEnabled && !loginDto.otp) {
      throw new UnauthorizedException("OTP required for login");
    }
    if (user.twoFactorEnabled && loginDto.otp) {
      const isOtpValid = await this.authService.verifyOtp(user.email, loginDto.otp);
      if (!isOtpValid) throw new UnauthorizedException("Invalid OTP");
    }

    const tokens = await this.authService.generateTokens(user);

    // ✅ Log session (Automatically captures IP & device info)
    await this.authService.logSession(user.id, req);

    return tokens;
  }

  // logout

  @Post("logout")
  @UseGuards(JwtAuthGuard) // 🔐 Ensure user is authenticated
  async logout(@Req() req: Request, @Res() res: Response) {
    const user = req.user as AuthenticatedUser;
    if (!user?.userId) throw new UnauthorizedException("Unauthorized");

    // 🛑 Revoke all active sessions for this user
    await this.authService.revokeAllSessions(user.userId);

    // 🛑 Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.json({ message: "Logged out from all devices" });
  }



  // 2️⃣ Password Reset
  @Post("request-password-reset")
  async requestPasswordReset(@Body("email") email: string) {
    return this.passwordService.requestPasswordReset(email);
  }

  @Post("reset-password/:token")
  async resetPassword(@Param("token") token: string, @Body("newPassword") newPassword: string) {
    return this.passwordService.resetPassword(token, newPassword);
  }


  // 📨 User Requests Unlock Link
  @Post("request-unlock")
  @UseGuards(JwtAuthGuard)
  async requestUnlock(@Body("email") email: string) {
    return this.authService.requestAccountUnlock(email);
  }



  // 3️⃣ Account Locking & Unlocking
  @Post("unlock-account")
  @UseGuards(JwtAuthGuard)
  async unlockAccount(@Body("email") email: string) {
    return this.authService.unlockAccount(email);
  }

  // 🟢 Fetch Active Sessions API (NEW)
  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  async getUserSessions(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    if (!user?.userId) throw new UnauthorizedException("Unauthorized");

    return this.authService.getUserSessions(user.userId);
  }

  //API to Revoke a Session
  @Delete("session/:sessionId")
  @UseGuards(JwtAuthGuard) // ✅ Ensure authentication
  async revokeSession(@Param("sessionId") sessionId: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    if (!user?.userId) throw new UnauthorizedException("Unauthorized");

    return this.authService.revokeSession(user.userId, sessionId);
  }

  // 4️⃣ OAuth Social Logins
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  async googleLogin() { }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Req() req) {
    if (!req.user) throw new UnauthorizedException("OAuth login failed");
    return this.authService.generateJwt(req.user.id, req.user.email);
  }


  @Get("facebook")
  @UseGuards(FacebookAuthGuard)
  async facebookLogin() { }

  @Get("facebook/callback")
  @UseGuards(FacebookAuthGuard)
  async facebookLoginCallback(@Req() req) {
    if (!req.user) throw new UnauthorizedException("OAuth login failed");
    return this.authService.generateJwt(req.user.id, req.user.email);
  }

  @Get("twitter")
  @UseGuards(TwitterAuthGuard)
  async twitterLogin() { }

  @Get("twitter/callback")
  @UseGuards(TwitterAuthGuard)
  async twitterLoginCallback(@Req() req) {
    if (!req.user) throw new UnauthorizedException("OAuth login failed");
    return this.authService.generateJwt(req.user.id, req.user.email);
  }

  @Get("linkedin")
  @UseGuards(LinkedInAuthGuard)
  async linkedinLogin() { }

  @Get("linkedin/callback")
  @UseGuards(LinkedInAuthGuard)
  async linkedinLoginCallback(@Req() req) {
    if (!req.user) throw new UnauthorizedException("OAuth login failed");
    return this.authService.generateJwt(req.user.id, req.user.email);
  }

  // 5️⃣ OTP-based Authentication
  @Post("request-otp")
  async requestOtp(@Body("email") email: string) {
    return this.authService.sendOtp(email);
  }

  @Post("verify-otp")
  async verifyOtp(@Body("email") email: string, @Body("otp") otp: string) {
    return this.authService.verifyOtp(email, otp);
  }

  // 6️⃣ Refresh Token System///////////

  @Post("refresh-token")
  async refreshToken(@Req() request: Request, @Res() response: Response) {
    const refreshToken = request.cookies["refreshToken"];
    if (!refreshToken) throw new UnauthorizedException("No refresh token found");

    const tokens = await this.authService.refreshTokens(refreshToken);

    if (!tokens?.accessToken || !tokens?.refreshToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    response.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return response.json({ accessToken: tokens.accessToken });
  }

  @Patch('/subscription')
  @UseGuards(JwtAuthGuard)
  async updateSubscription(@Req() req, @Body() body) {
    return this.authService.updateSubscription(req.user.id, body.plan);
  }


}

// 🔹 Two-Factor Authentication (2FA) Controller


@Controller("auth/2fa")
export class TwoFactorController {
  constructor(
    private twoFactorService: TwoFactorService,
    private authService: AuthService,
  ) { }

  @Post("setup")
  @UseGuards(JwtAuthGuard)
  async setupTwoFactor(@Req() req) {
    return this.twoFactorService.generateTwoFactorSecret(req.user.userId);
  }

  @Post("enable")
  @UseGuards(JwtAuthGuard)
  async enableTwoFactor(@Req() req) {
    return this.twoFactorService.enableTwoFactor(req.user.userId);

  }

  @Post("verify")
  async verifyTwoFactor(@Body("userId") userId: string, @Body("otp") otp: string) {
    const verified = await this.twoFactorService.verifyTwoFactorToken(userId, otp);
    if (!verified) return { error: "Invalid OTP" };
    return { message: "2FA Verified" };
  }

  // @Post("request-password-reset")
  // async requestPasswordReset(@Body("email") email: string) {
  //   return this.authService.requestPasswordReset(email);
  // }

  // @Post("reset-password")
  // async resetPassword(
  //   @Body("email") email: string,
  //   @Body("token") token: string,
  //   @Body("newPassword") newPassword: string
  // ) {
  //   return this.authService.resetPassword(email, token, newPassword);
  // }
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts
  message: { error: "Too many login attempts. Try again later." },
});






