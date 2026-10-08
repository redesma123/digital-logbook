import { Shift, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/response.js';
import { paginate, paginationArgs } from '../utils/pagination.js';
import {
  CreateLogbookBody,
  UpdateLogbookBody,
} from '../schemas/logbook.schema.js';

export interface ListLogbookFilters {
  unitId?: number;
  from?: string;
  to?: string;
  shift?: Shift;
  page?: number;
  limit?: number;
}

const logbookInclude = {
  unit: {
    select: {
      id: true,
      unit_code: true,
      name: true,
    },
  },
  operator: {
    select: {
      id: true,
      full_name: true,
      username: true,
    },
  },
  params_electrical: true,
  params_mechanical: true,
  params_hydraulic: true,
  attachments: true,
};

export class LogbookService {
  calculateShiftEndTime(date: Date, shift: Shift): Date {
    const dateStr = date.toISOString().split('T')[0];
    const d = new Date(dateStr + 'T00:00:00Z');

    if (shift === 'PAGI') {
      return new Date(`${dateStr}T14:00:00Z`);
    } else if (shift === 'SIANG') {
      return new Date(`${dateStr}T22:00:00Z`);
    } else {
      // MALAM: next day 06:00
      const nextDay = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      return new Date(`${nextDayStr}T06:00:00Z`);
    }
  }

  async create(data: CreateLogbookBody, operatorId: number) {
    // 1. Verify unit exists
    const unit = await prisma.units.findUnique({
      where: { id: data.unit_id },
    });

    if (!unit) {
      throw new AppError(404, 'Not Found', 'Unit tidak ditemukan');
    }

    // 2. Validate hour meter range: hour_meter_end >= hour_meter_start
    if (
      data.hour_meter_start !== undefined &&
      data.hour_meter_start !== null &&
      data.hour_meter_end !== undefined &&
      data.hour_meter_end !== null
    ) {
      if (data.hour_meter_end < data.hour_meter_start) {
        throw new AppError(422, 'Unprocessable Entity', 'hour_meter_end harus lebih besar atau sama dengan hour_meter_start');
      }
    }

    // 3. Auto-calculate running_hours if not provided
    let runningHours = data.running_hours;
    if (
      (runningHours === undefined || runningHours === null) &&
      data.hour_meter_start !== undefined &&
      data.hour_meter_start !== null &&
      data.hour_meter_end !== undefined &&
      data.hour_meter_end !== null
    ) {
      runningHours = Number((data.hour_meter_end - data.hour_meter_start).toFixed(2));
    }

    // 4. Parse date string to Date object
    const dateObj = new Date(data.date + 'T00:00:00Z');

    // 5. Use prisma.$transaction() to atomically create logbook_entries and parameter tables
    try {
      return await prisma.$transaction(async (tx) => {
        const entry = await tx.logbook_entries.create({
          data: {
            unit_id: data.unit_id,
            operator_id: operatorId,
            date: dateObj,
            shift: data.shift,
            unit_status: data.unit_status,
            hour_meter_start: data.hour_meter_start,
            hour_meter_end: data.hour_meter_end,
            running_hours: runningHours,
            notes: data.notes,
          },
        });

        if (data.electrical) {
          await tx.params_electrical.create({
            data: {
              ...data.electrical,
              logbook_id: entry.id,
            },
          });
        }

        if (data.mechanical) {
          await tx.params_mechanical.create({
            data: {
              ...data.mechanical,
              logbook_id: entry.id,
            },
          });
        }

        if (data.hydraulic) {
          await tx.params_hydraulic.create({
            data: {
              ...data.hydraulic,
              logbook_id: entry.id,
            },
          });
        }

        return tx.logbook_entries.findUnique({
          where: { id: entry.id },
          include: logbookInclude,
        });
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new AppError(409, 'Conflict', 'Entri logbook untuk unit, tanggal, dan shift ini sudah ada');
      }
      throw err;
    }
  }

  async list(filters: ListLogbookFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const where: Prisma.logbook_entriesWhereInput = {
      deleted_at: null,
    };

    if (filters.unitId) {
      where.unit_id = filters.unitId;
    }

    if (filters.shift) {
      where.shift = filters.shift;
    }

    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) {
        where.date.gte = new Date(filters.from + 'T00:00:00Z');
      }
      if (filters.to) {
        where.date.lte = new Date(filters.to + 'T00:00:00Z');
      }
    }

    const [total, items] = await Promise.all([
      prisma.logbook_entries.count({ where }),
      prisma.logbook_entries.findMany({
        where,
        include: logbookInclude,
        ...paginationArgs(page, limit),
        orderBy: [
          { date: 'desc' },
          { shift: 'desc' },
        ],
      }),
    ]);

    const pagination = paginate(total, page, limit);

    return {
      items,
      entries: items,
      pagination,
    };
  }

  async getById(id: number) {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    const entry = await prisma.logbook_entries.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        ...logbookInclude,
        attachments: true,
      },
    });

    if (!entry) {
      throw new AppError(404, 'Not Found', 'Entri logbook tidak ditemukan');
    }

    return entry;
  }

  async update(id: number, data: UpdateLogbookBody, _userId: number, userRole: string) {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    const entry = await prisma.logbook_entries.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        params_electrical: true,
        params_mechanical: true,
        params_hydraulic: true,
      },
    });

    if (!entry) {
      throw new AppError(404, 'Not Found', 'Entri logbook tidak ditemukan');
    }

    // Business rule: Operator can edit within 24 hours after shift. Supervisor can always edit.
    if (userRole === 'OPERATOR') {
      const shiftEndTime = this.calculateShiftEndTime(entry.date, entry.shift);
      const diffHours = (Date.now() - shiftEndTime.getTime()) / (1000 * 60 * 60);
      if (diffHours > 24) {
        throw new AppError(403, 'Forbidden', 'Operator hanya dapat mengedit logbook dalam waktu 24 jam setelah shift');
      }
    }

    // Validate hour meter consistency
    const start = data.hour_meter_start !== undefined ? data.hour_meter_start : entry.hour_meter_start;
    const end = data.hour_meter_end !== undefined ? data.hour_meter_end : entry.hour_meter_end;

    if (start !== null && start !== undefined && end !== null && end !== undefined) {
      if (end < start) {
        throw new AppError(422, 'Unprocessable Entity', 'hour_meter_end harus lebih besar atau sama dengan hour_meter_start');
      }
    }

    // Determine running_hours
    let runningHoursToSet = data.running_hours;
    if (
      runningHoursToSet === undefined &&
      (data.hour_meter_start !== undefined || data.hour_meter_end !== undefined) &&
      start !== null &&
      start !== undefined &&
      end !== null &&
      end !== undefined
    ) {
      runningHoursToSet = Number((end - start).toFixed(2));
    }

    return prisma.$transaction(async (tx) => {
      const updateData: Prisma.logbook_entriesUpdateInput = {};
      if (data.unit_status !== undefined) updateData.unit_status = data.unit_status;
      if (data.hour_meter_start !== undefined) updateData.hour_meter_start = data.hour_meter_start;
      if (data.hour_meter_end !== undefined) updateData.hour_meter_end = data.hour_meter_end;
      if (runningHoursToSet !== undefined) updateData.running_hours = runningHoursToSet;
      if (data.notes !== undefined) updateData.notes = data.notes;

      await tx.logbook_entries.update({
        where: { id },
        data: updateData,
      });

      if (data.electrical) {
        await tx.params_electrical.upsert({
          where: { logbook_id: id },
          create: {
            ...data.electrical,
            logbook_id: id,
          },
          update: data.electrical,
        });
      }

      if (data.mechanical) {
        await tx.params_mechanical.upsert({
          where: { logbook_id: id },
          create: {
            ...data.mechanical,
            logbook_id: id,
          },
          update: data.mechanical,
        });
      }

      if (data.hydraulic) {
        await tx.params_hydraulic.upsert({
          where: { logbook_id: id },
          create: {
            ...data.hydraulic,
            logbook_id: id,
          },
          update: data.hydraulic,
        });
      }

      return tx.logbook_entries.findUnique({
        where: { id },
        include: {
          ...logbookInclude,
          attachments: true,
        },
      });
    });
  }

  async remove(id: number, userRole?: string) {
    if (isNaN(id)) {
      throw new AppError(400, 'Bad Request', 'ID tidak valid');
    }

    if (userRole && userRole !== 'SUPERVISOR') {
      throw new AppError(403, 'Forbidden', 'Hanya SUPERVISOR yang dapat menghapus logbook');
    }

    const entry = await prisma.logbook_entries.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!entry) {
      throw new AppError(404, 'Not Found', 'Entri logbook tidak ditemukan');
    }

    return prisma.logbook_entries.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async getLatestCounter(unitId: number) {
    if (isNaN(unitId)) {
      throw new AppError(400, 'Bad Request', 'unit_id tidak valid');
    }

    const unit = await prisma.units.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      throw new AppError(404, 'Not Found', 'Unit tidak ditemukan');
    }

    const latestEntry = await prisma.logbook_entries.findFirst({
      where: {
        unit_id: unitId,
        deleted_at: null,
      },
      orderBy: [
        { date: 'desc' },
        { shift: 'desc' },
      ],
      include: {
        operator: {
          select: {
            full_name: true,
          },
        },
      },
    });

    if (!latestEntry) {
      return {
        unit_id: unitId,
        last_date: null,
        last_shift: null,
        hour_meter_end: null,
        last_operator: null,
        unit_status: null,
      };
    }

    return {
      unit_id: unitId,
      last_date: latestEntry.date.toISOString().split('T')[0],
      last_shift: latestEntry.shift,
      hour_meter_end: latestEntry.hour_meter_end,
      last_operator: latestEntry.operator?.full_name ?? null,
      unit_status: latestEntry.unit_status,
    };
  }
}

export const logbookService = new LogbookService();
