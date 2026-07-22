import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    if (registerDto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: registerDto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Nomor telepon sudah terdaftar');
      }
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        fullName: registerDto.fullName,
        phone: registerDto.phone,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        globalRole: true,
        tier: true,
        createdAt: true,
      },
    });

    const accessToken = this.generateToken(user.id, user.email, user.globalRole);

    return {
      user,
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const accessToken = this.generateToken(user.id, user.email, user.globalRole);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        globalRole: user.globalRole,
        tier: user.tier,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
    };
  }

  private generateToken(userId: string, email: string, globalRole: string): string {
    const payload = { sub: userId, email, globalRole };
    return this.jwtService.sign(payload);
  }
}
