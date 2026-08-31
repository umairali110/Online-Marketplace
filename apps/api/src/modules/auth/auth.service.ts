import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { SmtpService } from './email/smtp.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private smtp: SmtpService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const otpCode = generateCode();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: dto.role ?? 'CUSTOMER',
        otpCode,
        otpExpiresAt,
      },
    });

    await this.smtp.sendOtpEmail(user.email, user.name, otpCode);
    return { message: 'Registered. Check your email for the verification code.' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.otpCode || !user.otpExpiresAt) throw new BadRequestException('Invalid request');
    if (user.otpCode !== dto.code) throw new BadRequestException('Invalid code');
    if (user.otpExpiresAt < new Date()) throw new BadRequestException('Code expired');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, otpCode: null, otpExpiresAt: null },
    });
    return { message: 'Email verified. You can now log in.' };
  }

  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    if (user.emailVerified) throw new BadRequestException('Already verified');

    const otpCode = generateCode();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.user.update({ where: { id: user.id }, data: { otpCode, otpExpiresAt } });
    await this.smtp.sendOtpEmail(user.email, user.name, otpCode);
    return { message: 'A new code has been sent.' };
  }

  async login(dto: LoginDto, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (!user.emailVerified) throw new UnauthorizedException('Please verify your email first');

    const tokens = await this.issueTokens(user.id, user.email, user.role, userAgent);
    return { user: this.sanitize(user), ...tokens };
  }

  async refresh(userId: string, jti: string, rawRefreshToken: string) {
    const record = await this.prisma.refreshToken.findUnique({ where: { id: jti } });
    if (!record || record.userId !== userId) throw new UnauthorizedException();

    if (record.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: jti } }).catch(() => {});
      throw new UnauthorizedException('Session expired');
    }

    const valid = await bcrypt.compare(rawRefreshToken, record.tokenHash);
    if (!valid) {
      await this.prisma.refreshToken.delete({ where: { id: jti } }).catch(() => {});
      throw new UnauthorizedException();
    }

    await this.prisma.refreshToken.delete({ where: { id: jti } });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.issueTokens(user.id, user.email, user.role, record.userAgent ?? undefined);
  }

  async logout(userId: string, rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const decoded: any = this.jwt.decode(rawRefreshToken);
      if (decoded?.jti) {
        await this.prisma.refreshToken.deleteMany({ where: { id: decoded.jti, userId } });
      }
    }
    return { message: 'Logged out' };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { message: 'Logged out of all devices' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const genericMessage = { message: 'If that email exists, a reset code has been sent.' };
    if (!user) return genericMessage;

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordCode: code, resetPasswordExpiresAt: expiresAt },
    });
    await this.smtp.sendPasswordResetEmail(user.email, user.name, code);
    return genericMessage;
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetPasswordCode || !user.resetPasswordExpiresAt) {
      throw new BadRequestException('Invalid or expired code');
    }
    if (user.resetPasswordCode !== code) throw new BadRequestException('Invalid code');
    if (user.resetPasswordExpiresAt < new Date()) throw new BadRequestException('Code expired');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetPasswordCode: null, resetPasswordExpiresAt: null },
    });
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    return { message: 'Password reset — please log in with your new password.' };
  }

  private async issueTokens(userId: string, email: string, role: string, userAgent?: string) {
    const tokenRecord = await this.prisma.refreshToken.create({
      data: { userId, tokenHash: '', userAgent, expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS) },
    });

    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, jti: tokenRecord.id },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
    );

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.update({ where: { id: tokenRecord.id }, data: { tokenHash } });

    return { accessToken, refreshToken };
  }

  private sanitize(user: any) {
    const { passwordHash, otpCode, resetPasswordCode, ...rest } = user;
    return rest;
  }
}