import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  otp?: string; // Optional for 2FA
}

