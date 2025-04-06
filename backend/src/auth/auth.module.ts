import { Module } from "@nestjs/common";
import { AuthService } from "../services/authservices";
import { AuthController } from "src/controller/authcontroller";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "prisma/prisma.module";
import { JwtStrategy } from "src/strategy/jwt.strategy";
import { PasswordService } from "src/passwordresetservices/password.services";

import { TwoFactorService } from "./twofactor.service";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "7d" },
    }),
    PrismaModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordService, TwoFactorService],
  exports: [AuthService], // ✅ Export AuthService if used elsewhere
})
export class AuthModule {}
