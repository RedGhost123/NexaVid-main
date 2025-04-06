// src/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, MinLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Full name should not be empty.' })
  fullName?: string;

  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty.' })
  @MinLength(6, { message: 'Password should be at least 6 characters long.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;
}
