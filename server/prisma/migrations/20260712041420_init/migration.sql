-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('TRUCK', 'VAN', 'CAR', 'BUS', 'TRAILER', 'PICKUP', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('TOLL', 'MAINTENANCE', 'PARKING', 'INSURANCE', 'FINE', 'OTHER');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" "RoleName" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "registration_number" TEXT NOT NULL,
    "name_or_model" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "max_load_capacity" DOUBLE PRECISION NOT NULL,
    "odometer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "acquisition_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "region" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "license_category" TEXT NOT NULL,
    "license_expiry_date" DATE NOT NULL,
    "contact_number" TEXT NOT NULL,
    "safety_score" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "status" "DriverStatus" NOT NULL DEFAULT 'AVAILABLE',
    "region" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "driver_id" INTEGER NOT NULL,
    "cargo_weight" DOUBLE PRECISION NOT NULL,
    "planned_distance" DOUBLE PRECISION NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'DRAFT',
    "dispatch_time" TIMESTAMP(3),
    "completion_time" TIMESTAMP(3),
    "start_odometer" DOUBLE PRECISION,
    "final_odometer" DOUBLE PRECISION,
    "fuel_consumed" DOUBLE PRECISION,
    "revenue" DECIMAL(12,2),
    "cancellation_reason" TEXT,
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_logs" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "service_type" TEXT NOT NULL,
    "issue_notes" TEXT,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "cost" DECIMAL(12,2),
    "remarks" TEXT,
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_logs" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "date" DATE NOT NULL,
    "odometer_reading" DOUBLE PRECISION,
    "related_trip_id" INTEGER,
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuel_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "related_trip_id" INTEGER,
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_registration_number_key" ON "vehicles"("registration_number");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicles_region_idx" ON "vehicles"("region");

-- CreateIndex
CREATE INDEX "vehicles_type_idx" ON "vehicles"("type");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_license_number_key" ON "drivers"("license_number");

-- CreateIndex
CREATE INDEX "drivers_status_idx" ON "drivers"("status");

-- CreateIndex
CREATE INDEX "drivers_region_idx" ON "drivers"("region");

-- CreateIndex
CREATE INDEX "drivers_license_expiry_date_idx" ON "drivers"("license_expiry_date");

-- CreateIndex
CREATE INDEX "trips_status_idx" ON "trips"("status");

-- CreateIndex
CREATE INDEX "trips_vehicle_id_idx" ON "trips"("vehicle_id");

-- CreateIndex
CREATE INDEX "trips_driver_id_idx" ON "trips"("driver_id");

-- CreateIndex
CREATE INDEX "trips_dispatch_time_idx" ON "trips"("dispatch_time");

-- CreateIndex
CREATE INDEX "maintenance_logs_vehicle_id_idx" ON "maintenance_logs"("vehicle_id");

-- CreateIndex
CREATE INDEX "maintenance_logs_status_idx" ON "maintenance_logs"("status");

-- CreateIndex
CREATE INDEX "fuel_logs_vehicle_id_idx" ON "fuel_logs"("vehicle_id");

-- CreateIndex
CREATE INDEX "fuel_logs_date_idx" ON "fuel_logs"("date");

-- CreateIndex
CREATE INDEX "expenses_vehicle_id_idx" ON "expenses"("vehicle_id");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "expenses_date_idx" ON "expenses"("date");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_related_trip_id_fkey" FOREIGN KEY ("related_trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_related_trip_id_fkey" FOREIGN KEY ("related_trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
