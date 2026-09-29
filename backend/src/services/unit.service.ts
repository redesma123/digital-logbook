import { UnitStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/response.js';

export interface CreateUnitData {
  plant_id: number;
  unit_code: string;
  name: string;
}

export interface UpdateUnitData {
  unit_code?: string;
  name?: string;
  current_status?: UnitStatus;
}

export class UnitService {
  async list(plantId?: number) {
    const where = plantId ? { plant_id: plantId } : {};

    return prisma.units.findMany({
      where,
      include: {
        plant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async getById(id: number) {
    const unit = await prisma.units.findUnique({
      where: { id },
      include: {
        plant: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    if (!unit) {
      throw new AppError(404, 'Not Found', 'Unit tidak ditemukan');
    }

    return unit;
  }

  async create(data: CreateUnitData) {
    const plant = await prisma.plants.findUnique({
      where: { id: data.plant_id },
    });

    if (!plant) {
      throw new AppError(404, 'Not Found', 'Plant tidak ditemukan');
    }

    return prisma.units.create({
      data,
      include: {
        plant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateUnitData) {
    await this.getById(id);

    return prisma.units.update({
      where: { id },
      data,
      include: {
        plant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}

export const unitService = new UnitService();
