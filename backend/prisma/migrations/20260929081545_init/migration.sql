-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OPERATOR', 'SUPERVISOR', 'MANAGEMENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('RUNNING', 'STANDBY', 'TRIP', 'OFFLINE');

-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('PAGI', 'SIANG', 'MALAM');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'PROCESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('PLAN', 'PROCESS', 'COMPLETE');

-- CreateEnum
CREATE TYPE "AttachmentStatus" AS ENUM ('ACTIVE', 'DELETED_BY_RETENTION');

-- CreateEnum
CREATE TYPE "AttachmentRelatedTo" AS ENUM ('LOGBOOK', 'INCIDENT', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plants" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "capacity_kw" DOUBLE PRECISION,
    "design_flow_m3s" DOUBLE PRECISION,
    "design_head_m" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" SERIAL NOT NULL,
    "plant_id" INTEGER NOT NULL,
    "unit_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "current_status" "UnitStatus" NOT NULL DEFAULT 'STANDBY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logbook_entries" (
    "id" SERIAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "operator_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "shift" "Shift" NOT NULL,
    "unit_status" "UnitStatus" NOT NULL,
    "hour_meter_start" DOUBLE PRECISION,
    "hour_meter_end" DOUBLE PRECISION,
    "running_hours" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "logbook_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "params_electrical" (
    "id" SERIAL NOT NULL,
    "logbook_id" INTEGER NOT NULL,
    "voltage_v" DOUBLE PRECISION,
    "current_a" DOUBLE PRECISION,
    "frequency_hz" DOUBLE PRECISION,
    "active_power_kw" DOUBLE PRECISION,
    "reactive_power_kvar" DOUBLE PRECISION,
    "power_factor" DOUBLE PRECISION,
    "energy_production_kwh" DOUBLE PRECISION,
    "generator_status" TEXT,

    CONSTRAINT "params_electrical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "params_mechanical" (
    "id" SERIAL NOT NULL,
    "logbook_id" INTEGER NOT NULL,
    "rpm" DOUBLE PRECISION,
    "bearing_temp_c" DOUBLE PRECISION,
    "generator_temp_c" DOUBLE PRECISION,
    "turbine_temp_c" DOUBLE PRECISION,
    "vibration_mms" DOUBLE PRECISION,

    CONSTRAINT "params_mechanical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "params_hydraulic" (
    "id" SERIAL NOT NULL,
    "logbook_id" INTEGER NOT NULL,
    "flow_rate_m3s" DOUBLE PRECISION,
    "water_level_m" DOUBLE PRECISION,
    "head_m" DOUBLE PRECISION,
    "pressure_bar" DOUBLE PRECISION,
    "intake_condition" TEXT,

    CONSTRAINT "params_hydraulic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" SERIAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "reported_by_id" INTEGER NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "equipment" TEXT NOT NULL,
    "incident_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "operator_action" TEXT,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_status_histories" (
    "id" SERIAL NOT NULL,
    "incident_id" INTEGER NOT NULL,
    "changed_by_id" INTEGER NOT NULL,
    "from_status" "IncidentStatus",
    "to_status" "IncidentStatus" NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "incident_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" SERIAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "equipment" TEXT NOT NULL,
    "work_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technician" TEXT,
    "planned_date" TIMESTAMP(3),
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'PLAN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_status_histories" (
    "id" SERIAL NOT NULL,
    "maintenance_id" INTEGER NOT NULL,
    "changed_by_id" INTEGER NOT NULL,
    "from_status" "MaintenanceStatus",
    "to_status" "MaintenanceStatus" NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "maintenance_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "related_to" "AttachmentRelatedTo" NOT NULL,
    "logbook_id" INTEGER,
    "incident_id" INTEGER,
    "maintenance_id" INTEGER,
    "filename_stored" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "uploaded_by_id" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AttachmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_logbook_operator" ON "logbook_entries"("operator_id");

-- CreateIndex
CREATE UNIQUE INDEX "logbook_entries_unit_id_date_shift_key" ON "logbook_entries"("unit_id", "date", "shift");

-- CreateIndex
CREATE UNIQUE INDEX "params_electrical_logbook_id_key" ON "params_electrical"("logbook_id");

-- CreateIndex
CREATE UNIQUE INDEX "params_mechanical_logbook_id_key" ON "params_mechanical"("logbook_id");

-- CreateIndex
CREATE UNIQUE INDEX "params_hydraulic_logbook_id_key" ON "params_hydraulic"("logbook_id");

-- CreateIndex
CREATE INDEX "idx_incidents_unit" ON "incidents"("unit_id");

-- CreateIndex
CREATE INDEX "idx_incidents_status" ON "incidents"("status");

-- CreateIndex
CREATE INDEX "idx_maintenance_unit" ON "maintenance_records"("unit_id");

-- CreateIndex
CREATE INDEX "idx_maintenance_status" ON "maintenance_records"("status");

-- CreateIndex
CREATE INDEX "idx_attachments_related" ON "attachments"("related_to", "logbook_id", "incident_id", "maintenance_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbook_entries" ADD CONSTRAINT "logbook_entries_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logbook_entries" ADD CONSTRAINT "logbook_entries_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "params_electrical" ADD CONSTRAINT "params_electrical_logbook_id_fkey" FOREIGN KEY ("logbook_id") REFERENCES "logbook_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "params_mechanical" ADD CONSTRAINT "params_mechanical_logbook_id_fkey" FOREIGN KEY ("logbook_id") REFERENCES "logbook_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "params_hydraulic" ADD CONSTRAINT "params_hydraulic_logbook_id_fkey" FOREIGN KEY ("logbook_id") REFERENCES "logbook_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_status_histories" ADD CONSTRAINT "incident_status_histories_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_status_histories" ADD CONSTRAINT "incident_status_histories_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_status_histories" ADD CONSTRAINT "maintenance_status_histories_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenance_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_status_histories" ADD CONSTRAINT "maintenance_status_histories_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_logbook_id_fkey" FOREIGN KEY ("logbook_id") REFERENCES "logbook_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenance_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;
