import { IncidentStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/response.js';
import { paginate, paginationArgs } from '../utils/pagination.js';
import {
  CreateIncidentBody,
  UpdateIncidentBody,
} from '../schemas/incident.schema.js';

export interface ListIncidentFilters {
  unitId?: number;
  status?: IncidentStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

const incidentInclude = {
  unit: {
    select: {
      id: true,
      unit_code: true,
      name: true,
    },
  },
  reporter: {
    select: {
      id: true,
      full_name: true,
      username: true,
      role: true,
    },
  },
};

const incidentDetailInclude = {
  ...incidentInclude,
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

export class IncidentService {
  async create(data: CreateIncidentBody, reporterId: number) {
    const unit = await prisma.units.findUnique({
      where: { id: data.unit_id },
    });

    if (!unit) {
      throw new AppError(404, 'Not Found', 'Unit tidak ditemukan');
    }

    const occurredAt = new Date(data.occurred_at);

    const incident = await prisma.incidents.create({
      data: {
        unit_id: data.unit_id,
        reported_by_id: reporterId,
        occurred_at: occurredAt,
        equipment: data.equipment,
        incident_type: data.incident_type,
        description: data.description,
        operator_action: data.operator_action ?? null,
        status: 'OPEN',
      },
      include: incidentDetailInclude,
    });

    return incident;
  }

  async list(filters: ListIncidentFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const where: Prisma.incidentsWhereInput = {
      deleted_at: null,
    };

    if (filters.unitId) {
      where.unit_id = filters.unitId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.from || filters.to) {
      where.occurred_at = {};
      if (filters.from) {
        where.occurred_at.gte = new Date(
          filters.from.includes('T') ? filters.from : `${filters.from}T00:00:00Z`
        );
      }
      if (filters.to) {
        where.occurred_at.lte = new Date(
          filters.to.includes('T') ? filters.to : `${filters.to}T23:59:59.999Z`
        );
      }
    }

    const [total, items] = await Promise.all([
      prisma.incidents.count({ where }),
      prisma.incidents.findMany({
        where,
        include: incidentInclude,
        ...paginationArgs(page, limit),
        orderBy: { occurred_at: 'desc' },
      }),
    ]);

    const pagination = paginate(total, page, limit);

    return {
      items,
      incidents: items,
      pagination,
    };
  }

  async getById(id: number) {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    const incident = await prisma.incidents.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: incidentDetailInclude,
    });

    if (!incident) {
      throw new AppError(404, 'Not Found', 'Data gangguan tidak ditemukan');
    }

    return incident;
  }

  async update(id: number, data: UpdateIncidentBody) {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    const incident = await prisma.incidents.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!incident) {
      throw new AppError(404, 'Not Found', 'Data gangguan tidak ditemukan');
    }

    const updateData: Prisma.incidentsUpdateInput = {};
    if (data.equipment !== undefined) updateData.equipment = data.equipment;
    if (data.incident_type !== undefined) updateData.incident_type = data.incident_type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.operator_action !== undefined) updateData.operator_action = data.operator_action;
    if (data.occurred_at !== undefined) updateData.occurred_at = new Date(data.occurred_at);

    return prisma.incidents.update({
      where: { id },
      data: updateData,
      include: incidentDetailInclude,
    });
  }

  async changeStatus(
    id: number,
    newStatus: IncidentStatus,
    notes: string | undefined,
    userId: number,
    userRole: string
  ) {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    const incident = await prisma.incidents.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!incident) {
      throw new AppError(404, 'Not Found', 'Data gangguan tidak ditemukan');
    }

    if (incident.status === newStatus) {
      throw new AppError(400, 'Bad Request', `Status gangguan saat ini sudah ${newStatus}`);
    }

    // Role-based transition checks
    if (userRole === 'OPERATOR') {
      if (newStatus !== 'PROCESS') {
        throw new AppError(403, 'Forbidden', 'Operator hanya dapat mengubah status ke PROCESS');
      }
      if (incident.status === 'CLOSED') {
        throw new AppError(403, 'Forbidden', 'Hanya SUPERVISOR yang dapat mengubah status dari CLOSED');
      }
    }

    // Backward transition: CLOSED -> PROCESS requires notes
    if (incident.status === 'CLOSED' && newStatus === 'PROCESS') {
      if (!notes || notes.trim() === '') {
        throw new AppError(400, 'Bad Request', 'Catatan/alasan wajib diisi untuk perubahan status kembali ke PROCESS');
      }
    }

    let resolvedAt: Date | null = incident.resolved_at;
    if (newStatus === 'CLOSED') {
      resolvedAt = new Date();
    } else if (incident.status === 'CLOSED') {
      resolvedAt = null;
    }

    return prisma.$transaction(async (tx) => {
      await tx.incidents.update({
        where: { id },
        data: {
          status: newStatus,
          resolved_at: resolvedAt,
        },
      });

      await tx.incident_status_histories.create({
        data: {
          incident_id: id,
          changed_by_id: userId,
          from_status: incident.status,
          to_status: newStatus,
          notes: notes ?? null,
          changed_at: new Date(),
        },
      });

      return tx.incidents.findUnique({
        where: { id },
        include: incidentDetailInclude,
      });
    });
  }

  async remove(id: number, userRole?: string) {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    if (userRole && userRole !== 'SUPERVISOR') {
      throw new AppError(403, 'Forbidden', 'Hanya SUPERVISOR yang dapat menghapus data gangguan');
    }

    const incident = await prisma.incidents.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!incident) {
      throw new AppError(404, 'Not Found', 'Data gangguan tidak ditemukan');
    }

    return prisma.incidents.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}

export const incidentService = new IncidentService();
