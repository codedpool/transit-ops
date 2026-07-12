-- Add DB-level CHECK constraints (not expressible in the Prisma schema).
-- Complements app-layer validation and the cross-row rules in the service layer.
-- A CHECK passes when the column is NULL, so optional fields stay optional.

ALTER TABLE "vehicles"
  ADD CONSTRAINT "chk_vehicles_max_load_capacity_positive" CHECK ("max_load_capacity" > 0),
  ADD CONSTRAINT "chk_vehicles_odometer_nonneg" CHECK ("odometer" >= 0),
  ADD CONSTRAINT "chk_vehicles_acquisition_cost_nonneg" CHECK ("acquisition_cost" >= 0);

ALTER TABLE "drivers"
  ADD CONSTRAINT "chk_drivers_safety_score_range" CHECK ("safety_score" >= 0 AND "safety_score" <= 100);

ALTER TABLE "trips"
  ADD CONSTRAINT "chk_trips_cargo_weight_positive" CHECK ("cargo_weight" > 0),
  ADD CONSTRAINT "chk_trips_planned_distance_nonneg" CHECK ("planned_distance" >= 0),
  ADD CONSTRAINT "chk_trips_start_odometer_nonneg" CHECK ("start_odometer" >= 0),
  ADD CONSTRAINT "chk_trips_final_odometer_nonneg" CHECK ("final_odometer" >= 0),
  ADD CONSTRAINT "chk_trips_fuel_consumed_nonneg" CHECK ("fuel_consumed" >= 0),
  ADD CONSTRAINT "chk_trips_revenue_nonneg" CHECK ("revenue" >= 0);

ALTER TABLE "maintenance_logs"
  ADD CONSTRAINT "chk_maintenance_logs_cost_nonneg" CHECK ("cost" >= 0);

ALTER TABLE "fuel_logs"
  ADD CONSTRAINT "chk_fuel_logs_liters_positive" CHECK ("liters" > 0),
  ADD CONSTRAINT "chk_fuel_logs_cost_nonneg" CHECK ("cost" >= 0),
  ADD CONSTRAINT "chk_fuel_logs_odometer_reading_nonneg" CHECK ("odometer_reading" >= 0);

ALTER TABLE "expenses"
  ADD CONSTRAINT "chk_expenses_amount_nonneg" CHECK ("amount" >= 0);
