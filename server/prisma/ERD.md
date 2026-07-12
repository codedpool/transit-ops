# TransitOps — Entity Relationship Diagram

Visual reference for `schema.prisma`. Renders automatically on GitHub. Source of truth is the Prisma schema + migrations.

```mermaid
erDiagram
    ROLE ||--o{ USER : "has"
    VEHICLE ||--o{ TRIP : "used in"
    DRIVER ||--o{ TRIP : "drives"
    VEHICLE ||--o{ MAINTENANCE_LOG : "serviced by"
    VEHICLE ||--o{ FUEL_LOG : "fueled by"
    VEHICLE ||--o{ EXPENSE : "incurs"
    USER |o--o{ TRIP : "created by"
    USER |o--o{ MAINTENANCE_LOG : "logged by"
    USER |o--o{ FUEL_LOG : "logged by"
    USER |o--o{ EXPENSE : "logged by"
    TRIP |o--o{ FUEL_LOG : "linked to"
    TRIP |o--o{ EXPENSE : "linked to"

    ROLE {
        int id PK
        RoleName name UK
        string description
    }
    USER {
        int id PK
        string email UK
        string password_hash
        int role_id FK
        boolean is_active
    }
    VEHICLE {
        int id PK
        string registration_number UK
        string name_or_model
        VehicleType type
        float max_load_capacity
        float odometer
        decimal acquisition_cost
        VehicleStatus status
        string region
    }
    DRIVER {
        int id PK
        string name
        string license_number UK
        string license_category
        date license_expiry_date
        float safety_score
        DriverStatus status
        string region
    }
    TRIP {
        int id PK
        string source
        string destination
        int vehicle_id FK
        int driver_id FK
        float cargo_weight
        float planned_distance
        TripStatus status
        float start_odometer
        float final_odometer
        float fuel_consumed
        decimal revenue
        int created_by_id FK
    }
    MAINTENANCE_LOG {
        int id PK
        int vehicle_id FK
        string service_type
        MaintenanceStatus status
        datetime opened_at
        datetime closed_at
        decimal cost
        int created_by_id FK
    }
    FUEL_LOG {
        int id PK
        int vehicle_id FK
        float liters
        decimal cost
        date date
        float odometer_reading
        int related_trip_id FK
        int created_by_id FK
    }
    EXPENSE {
        int id PK
        int vehicle_id FK
        ExpenseCategory category
        decimal amount
        date date
        int related_trip_id FK
        int created_by_id FK
    }
```

**Legend:** `||--o{` one-to-many (required parent) · `|o--o{` one-to-many (optional parent) · PK primary key · FK foreign key · UK unique.

**Constraints:** unique (`registration_number`, `license_number`, `email`, `role.name`); foreign keys on all links (Restrict on master data, SetNull on optional links); 15 CHECK constraints (positive/non-negative amounts, `safety_score` 0–100). Cross-row rule `cargo_weight <= vehicle.max_load_capacity` is enforced in the service layer.
