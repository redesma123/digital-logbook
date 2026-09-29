import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import { AppError } from '../lib/response.js';
import type { JwtPayload } from '../middleware/auth.js';

export class AuthService {
  async login(username: string, password: string) {
    const user = await prisma.users.findUnique({ where: { username } });
    if (!user || !user.is_active) {
      throw new AppError(401, 'Unauthorized', 'Username atau password salah');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AppError(401, 'Unauthorized', 'Username atau password salah');
    }

    const payload: JwtPayload = { userId: user.id, username: user.username, role: user.role };
    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const hashedToken = await bcrypt.hash(rawRefreshToken, env.BCRYPT_SALT_ROUNDS);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refresh_tokens.create({
      data: { token: hashedToken, user_id: user.id, expires_at: expiresAt },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: { id: user.id, username: user.username, fullName: user.full_name, role: user.role },
    };
  }

  async refresh(rawRefreshToken: string) {
    const tokens = await prisma.refresh_tokens.findMany({
      where: { expires_at: { gt: new Date() } },
      include: { user: true },
    });

    let matchedToken: typeof tokens[0] | null = null;
    for (const t of tokens) {
      if (await bcrypt.compare(rawRefreshToken, t.token)) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken || !matchedToken.user.is_active) {
      throw new AppError(401, 'Unauthorized', 'Refresh token tidak valid atau sudah kedaluwarsa');
    }

    const payload: JwtPayload = {
      userId: matchedToken.user.id,
      username: matchedToken.user.username,
      role: matchedToken.user.role,
    };
    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] });

    return { accessToken };
  }

  async logout(rawRefreshToken: string) {
    const tokens = await prisma.refresh_tokens.findMany();
    for (const t of tokens) {
      if (await bcrypt.compare(rawRefreshToken, t.token)) {
        await prisma.refresh_tokens.delete({ where: { id: t.id } });
        return;
      }
    }
    throw new AppError(401, 'Unauthorized', 'Refresh token tidak valid');
  }

  async getProfile(userId: number) {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'Not Found', 'User tidak ditemukan');
    return { id: user.id, username: user.username, fullName: user.full_name, role: user.role };
  }
}

export const authService = new AuthService();
