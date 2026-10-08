import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import { AppError } from '../lib/response.js';
import { paginate, paginationArgs } from '../utils/pagination.js';

export const userSelect = {
  id: true,
  username: true,
  full_name: true,
  role: true,
  is_active: true,
  created_at: true,
  updated_at: true,
};

export interface CreateUserData {
  username: string;
  password: string;
  fullName: string;
  role: Role;
}

export interface UpdateUserData {
  fullName?: string;
  role?: Role;
  is_active?: boolean;
  password?: string;
}

export class UserService {
  async list(page: number = 1, limit: number = 10, role?: Role) {
    const where: { role?: Role } = {};
    if (role) {
      where.role = role;
    }

    const [total, users] = await Promise.all([
      prisma.users.count({ where }),
      prisma.users.findMany({
        where,
        select: userSelect,
        ...paginationArgs(page, limit),
        orderBy: { id: 'asc' },
      }),
    ]);

    const pagination = paginate(total, page, limit);
    return {
      users,
      items: users,
      pagination,
    };
  }

  async getById(id: number) {
    const user = await prisma.users.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new AppError(404, 'Not Found', 'User tidak ditemukan');
    }

    return user;
  }

  async create(data: CreateUserData) {
    const existing = await prisma.users.findUnique({
      where: { username: data.username },
    });

    if (existing) {
      throw new AppError(409, 'Conflict', 'Username sudah digunakan');
    }

    const password_hash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

    return prisma.users.create({
      data: {
        username: data.username,
        password_hash,
        full_name: data.fullName,
        role: data.role,
      },
      select: userSelect,
    });
  }

  async update(id: number, data: UpdateUserData) {
    await this.getById(id);

    const updatePayload: {
      full_name?: string;
      role?: Role;
      is_active?: boolean;
      password_hash?: string;
    } = {};

    if (data.fullName !== undefined) {
      updatePayload.full_name = data.fullName;
    }
    if (data.role !== undefined) {
      updatePayload.role = data.role;
    }
    if (data.is_active !== undefined) {
      updatePayload.is_active = data.is_active;
    }
    if (data.password !== undefined) {
      updatePayload.password_hash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);
    }

    return prisma.users.update({
      where: { id },
      data: updatePayload,
      select: userSelect,
    });
  }

  async remove(id: number) {
    await this.getById(id);

    return prisma.users.update({
      where: { id },
      data: { is_active: false },
      select: userSelect,
    });
  }
}

export const userService = new UserService();
