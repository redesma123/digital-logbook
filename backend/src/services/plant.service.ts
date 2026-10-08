import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/response.js';

export interface CreatePlantData {
  name: string;
  location: string;
  capacity_kw?: number;
  design_flow_m3s?: number;
  design_head_m?: number;
}

export interface UpdatePlantData {
  name?: string;
  location?: string;
  capacity_kw?: number | null;
  design_flow_m3s?: number | null;
  design_head_m?: number | null;
}

export class PlantService {
  async list() {
    const plants = await prisma.plants.findMany({
      include: {
        _count: {
          select: { units: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    return plants.map(plant => ({
      ...plant,
      units_count: plant._count.units,
    }));
  }

  async getById(id: number) {
    const plant = await prisma.plants.findUnique({
      where: { id },
      include: {
        units: {
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!plant) {
      throw new AppError(404, 'Not Found', 'Plant tidak ditemukan');
    }

    return plant;
  }

  async create(data: CreatePlantData) {
    return prisma.plants.create({
      data,
    });
  }

  async update(id: number, data: UpdatePlantData) {
    await this.getById(id);

    return prisma.plants.update({
      where: { id },
      data,
    });
  }
}

export const plantService = new PlantService();
