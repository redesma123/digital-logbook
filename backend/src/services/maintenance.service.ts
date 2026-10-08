import { MaintenanceStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/response.js';
import { paginate, paginationArgs } from '../utils/pagination.js';
import {
  CreateMaintenanceBody,
  UpdateMaintenanceBody,
} from '../schemas/maintenance.schema.js';

export interface ListMaintenanceFilters {
  unitId?: number;
  status?: MaintenanceStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

const maintenanceInclude = {
  unit: {
    select: {
      id: true,
      unit_code: true,
      name: true,
    },
  },
  creator: {
    select: {
      id: true,
      full_name: true,
      username: true,
      role: true,
    },
  },
  attachments: true,
};

const maintenanceDetailInclude = {
  ...maintenanceInclude,
  status_histories: {
    include: {
      changer: {
        select: {
          id: true,
          full_name: true,
          username: true,
          role: true,
        },
      },
    },
    orderBy: {
      changed_at: 'asc' as const,
    },
  },
  attachments: true,
};

export class MaintenanceService {
  async create(data: CreateMaintenanceBody, creatorId: number) {
    const unit = await prisma.units.findUnique({
      where: { id: data.unit_id },
    });

    if (!unit) {
      throw new AppError(404, 'Not Found', 'Unit tidak ditemukan');
    }

    const plannedDate = data.planned_date ? new Date(data.planned_date) : null;

    const maintenance = await prisma.maintenance_records.create({
      data: {
        unit_id: data.unit_id,
        created_by_id: creatorId,
        equipment: data.equipment,
        work_type: data.work_type,
        description: data.description,
        technician: data.technician ?? null,
        planned_date: plannedDate,
        status: 'PLAN',
      },
      include: maintenanceDetailInclude,
    });

    return maintenance;
  }

  async list(filters: ListMaintenanceFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const where: Prisma.maintenance_recordsWhereInput = {
      deleted_at: null,
    };

    if (filters.unitId) {
      where.unit_id = filters.unitId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.from || filters.to) {
      where.planned_date = {};
      if (filters.from) {
        where.planned_date.gte = new Date(
          filters.from.includes('T') ? filters.from : `${filters.from}T00:00:00Z`
        );
      }
      if (filters.to) {
        where.planned_date.lte = new Date(
          filters.to.includes('T') ? filters.to : `${filters.to}T23:59:59.999Z`
        );
      }
    }

    const [total, items] = await Promise.all([
      prisma.maintenance_records.count({ where }),
      prisma.maintenance_records.findMany({
        where,
        include: maintenanceInclude,
        ...paginationArgs(page, limit),
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const pagination = paginate(total, page, limit);

    return {
      items,
      maintenance: items,
      pagination,
    };
  }

  async getById(id: number) {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    const maintenance = await prisma.maintenance_records.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: maintenanceDetailInclude,
    });

    if (!maintenance) {
      throw new AppError(404, 'Not Found', 'Data pemeliharaan tidak ditemukan');
    }

    return maintenance;
  }

  async update(id: number, data: UpdateMaintenanceBody) {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    const maintenance = await prisma.maintenance_records.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!maintenance) {
      throw new AppError(404, 'Not Found', 'Data pemeliharaan tidak ditemukan');
    }

    const updateData: Prisma.maintenance_recordsUpdateInput = {};
    if (data.equipment !== undefined) updateData.equipment = data.equipment;
    if (data.work_type !== undefined) updateData.work_type = data.work_type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.technician !== undefined) updateData.technician = data.technician;
    if (data.planned_date !== undefined) {
      updateData.planned_date = data.planned_date ? new Date(data.planned_date) : null;
    }

    return prisma.maintenance_records.update({
      where: { id },
      data: updateData,
      include: maintenanceDetailInclude,
    });
  }

  async changeStatus(
    id: number,
    newStatus: MaintenanceStatus,
    notes: string | undefined,
    userId: number,
    userRole: string
  ) {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    if (userRole !== 'SUPERVISOR') {
      throw new AppError(403, 'Forbidden', 'Hanya SUPERVISOR yang dapat mengubah status pemeliharaan');
    }

    const maintenance = await prisma.maintenance_records.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!maintenance) {
      throw new AppError(404, 'Not Found', 'Data pemeliharaan tidak ditemukan');
    }

    if (maintenance.status === newStatus) {
      throw new AppError(400, 'Bad Request', `Status pemeliharaan saat ini sudah ${newStatus}`);
    }

    return prisma.$transaction(async (tx) => {
      await tx.maintenance_records.update({
        where: { id },
        data: {
          status: newStatus,
        },
      });

      await tx.maintenance_status_histories.create({
        data: {
          maintenance_id: id,
          changed_by_id: userId,
          from_status: maintenance.status,
          to_status: newStatus,
          notes: notes ?? null,
          changed_at: new Date(),
        },
      });

      return tx.maintenance_records.findUnique({
        where: { id },
        include: maintenanceDetailInclude,
      });
    });
  }

  async remove(id: number, userRole?: string) {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    if (userRole && userRole !== 'SUPERVISOR') {
      throw new AppError(403, 'Forbidden', 'Hanya SUPERVISOR yang dapat menghapus data pemeliharaan');
    }

    const maintenance = await prisma.maintenance_records.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!maintenance) {
      throw new AppError(404, 'Not Found', 'Data pemeliharaan tidak ditemukan');
    }

    return prisma.maintenance_records.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}

export const maintenanceService = new MaintenanceService();
