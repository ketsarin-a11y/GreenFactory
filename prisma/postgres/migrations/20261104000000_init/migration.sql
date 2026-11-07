-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED');

-- CreateTable
CREATE TABLE "company" (
    "company_id" SERIAL NOT NULL,
    "company_code" VARCHAR(50) NOT NULL,
    "company_name" VARCHAR(200) NOT NULL,
    "tax_id" VARCHAR(30),
    "industry_type" VARCHAR(100),
    "address" VARCHAR(500),
    "province" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100),
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "website" VARCHAR(255),
    "logo_path" VARCHAR(500),
    "subscription_plan" VARCHAR(50),
    "carbon_standard" VARCHAR(100),
    "timezone" VARCHAR(100),
    "currency" VARCHAR(10),
    "language" VARCHAR(10),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "factory" (
    "factory_id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "factory_code" VARCHAR(50) NOT NULL,
    "factory_name" VARCHAR(200) NOT NULL,
    "address" VARCHAR(500),
    "province" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "google_map_url" VARCHAR(500),
    "map_zoom" INTEGER,
    "layout_image_path" VARCHAR(500),
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "timezone" VARCHAR(100),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factory_pkey" PRIMARY KEY ("factory_id")
);

-- CreateTable
CREATE TABLE "building" (
    "building_id" SERIAL NOT NULL,
    "factory_id" INTEGER NOT NULL,
    "building_code" VARCHAR(50) NOT NULL,
    "building_name" VARCHAR(200) NOT NULL,
    "building_type" VARCHAR(100),
    "floor_count" INTEGER,
    "layout_x" DECIMAL(18,4),
    "layout_y" DECIMAL(18,4),
    "layout_width" DECIMAL(18,4),
    "layout_height" DECIMAL(18,4),
    "layout_rotation" DECIMAL(18,4),
    "description" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "building_pkey" PRIMARY KEY ("building_id")
);

-- CreateTable
CREATE TABLE "department" (
    "department_id" SERIAL NOT NULL,
    "building_id" INTEGER NOT NULL,
    "department_code" VARCHAR(50) NOT NULL,
    "department_name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "production_line" (
    "line_id" SERIAL NOT NULL,
    "department_id" INTEGER NOT NULL,
    "line_code" VARCHAR(50) NOT NULL,
    "line_name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_line_pkey" PRIMARY KEY ("line_id")
);

-- CreateTable
CREATE TABLE "role" (
    "role_id" SERIAL NOT NULL,
    "role_code" VARCHAR(50),
    "role_name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "permission" (
    "permission_id" SERIAL NOT NULL,
    "permission_code" VARCHAR(100) NOT NULL,
    "permission_name" VARCHAR(150) NOT NULL,
    "group_code" VARCHAR(100) NOT NULL,
    "group_name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_permission_id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "permission_level" VARCHAR(20) NOT NULL DEFAULT 'NONE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_permission_id")
);

-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "factory_id" INTEGER,
    "department_id" INTEGER,
    "role_id" INTEGER NOT NULL,
    "employee_code" VARCHAR(50),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "profile_image_path" VARCHAR(500),
    "failed_login_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "password_changed_at" TIMESTAMP(3),
    "password_expires_at" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "session_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "login_log" (
    "login_log_id" BIGSERIAL NOT NULL,
    "user_id" INTEGER,
    "attempted_email" VARCHAR(255),
    "login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logout_at" TIMESTAMP(3),
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "device" VARCHAR(150),
    "login_method" VARCHAR(50),
    "login_status" VARCHAR(30) NOT NULL,
    "failure_reason" VARCHAR(500),

    CONSTRAINT "login_log_pkey" PRIMARY KEY ("login_log_id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "audit_log_id" BIGSERIAL NOT NULL,
    "user_id" INTEGER,
    "table_name" VARCHAR(100) NOT NULL,
    "record_id" BIGINT NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("audit_log_id")
);

-- CreateTable
CREATE TABLE "notification" (
    "notification_id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "alert_id" BIGINT,
    "notification_type" VARCHAR(50) NOT NULL,
    "priority" VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "action_url" VARCHAR(500),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "machine_type" (
    "machine_type_id" SERIAL NOT NULL,
    "machine_type_code" VARCHAR(50) NOT NULL,
    "machine_type_name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_type_pkey" PRIMARY KEY ("machine_type_id")
);

-- CreateTable
CREATE TABLE "sensor_type" (
    "sensor_type_id" SERIAL NOT NULL,
    "sensor_type_code" VARCHAR(50) NOT NULL,
    "sensor_type_name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensor_type_pkey" PRIMARY KEY ("sensor_type_id")
);

-- CreateTable
CREATE TABLE "unit" (
    "unit_id" SERIAL NOT NULL,
    "unit_code" VARCHAR(50) NOT NULL,
    "unit_name" VARCHAR(100) NOT NULL,
    "symbol" VARCHAR(30) NOT NULL,
    "unit_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_pkey" PRIMARY KEY ("unit_id")
);

-- CreateTable
CREATE TABLE "resource_category" (
    "category_id" SERIAL NOT NULL,
    "category_code" VARCHAR(50) NOT NULL,
    "category_name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "resource_type" (
    "resource_type_id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "default_unit_id" INTEGER NOT NULL,
    "resource_code" VARCHAR(50) NOT NULL,
    "resource_name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "carbon_calculable" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_type_pkey" PRIMARY KEY ("resource_type_id")
);

-- CreateTable
CREATE TABLE "emission_factor" (
    "factor_id" SERIAL NOT NULL,
    "resource_type_id" INTEGER NOT NULL,
    "scope" VARCHAR(30),
    "region" VARCHAR(100),
    "source" VARCHAR(255),
    "factor" DECIMAL(18,6) NOT NULL,
    "factor_unit" VARCHAR(100) NOT NULL,
    "effective_date" DATE NOT NULL,
    "expiry_date" DATE,
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emission_factor_pkey" PRIMARY KEY ("factor_id")
);

-- CreateTable
CREATE TABLE "resource_usage" (
    "usage_id" BIGSERIAL NOT NULL,
    "usage_reference" VARCHAR(100) NOT NULL,
    "company_id" INTEGER NOT NULL,
    "factory_id" INTEGER,
    "building_id" INTEGER,
    "department_id" INTEGER,
    "line_id" INTEGER,
    "machine_id" INTEGER,
    "checkpoint_id" INTEGER,
    "resource_type_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "sensor_data_id" BIGINT,
    "qr_scan_id" BIGINT,
    "scope_type" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,
    "usage_at" TIMESTAMP(3) NOT NULL,
    "source_type" VARCHAR(50) NOT NULL,
    "evidence_file_path" VARCHAR(500),
    "remark" VARCHAR(1000),
    "recorded_by" INTEGER NOT NULL,
    "processing_status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_usage_pkey" PRIMARY KEY ("usage_id")
);

-- CreateTable
CREATE TABLE "machine" (
    "machine_id" SERIAL NOT NULL,
    "line_id" INTEGER NOT NULL,
    "machine_type_id" INTEGER NOT NULL,
    "machine_code" VARCHAR(50) NOT NULL,
    "machine_name" VARCHAR(200) NOT NULL,
    "manufacturer" VARCHAR(150),
    "model" VARCHAR(150),
    "serial_number" VARCHAR(150),
    "installation_date" DATE,
    "layout_x" DECIMAL(18,4),
    "layout_y" DECIMAL(18,4),
    "layout_width" DECIMAL(18,4),
    "layout_height" DECIMAL(18,4),
    "layout_rotation" DECIMAL(18,4),
    "location_note" VARCHAR(500),
    "operational_status" VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_pkey" PRIMARY KEY ("machine_id")
);

-- CreateTable
CREATE TABLE "checkpoint" (
    "checkpoint_id" SERIAL NOT NULL,
    "line_id" INTEGER NOT NULL,
    "checkpoint_code" VARCHAR(50) NOT NULL,
    "checkpoint_name" VARCHAR(200) NOT NULL,
    "checkpoint_type" VARCHAR(100),
    "description" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkpoint_pkey" PRIMARY KEY ("checkpoint_id")
);

-- CreateTable
CREATE TABLE "qr_code" (
    "qr_id" BIGSERIAL NOT NULL,
    "machine_id" INTEGER,
    "checkpoint_id" INTEGER,
    "qr_code" VARCHAR(500) NOT NULL,
    "qr_token" VARCHAR(255) NOT NULL,
    "qr_image_path" VARCHAR(500),
    "qr_status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_code_pkey" PRIMARY KEY ("qr_id")
);

-- CreateTable
CREATE TABLE "qr_scan_log" (
    "scan_id" BIGSERIAL NOT NULL,
    "qr_id" BIGINT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "scan_result" VARCHAR(50) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "device" VARCHAR(150),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_scan_log_pkey" PRIMARY KEY ("scan_id")
);

-- CreateTable
CREATE TABLE "sensor" (
    "sensor_id" SERIAL NOT NULL,
    "machine_id" INTEGER NOT NULL,
    "sensor_type_id" INTEGER NOT NULL,
    "sensor_code" VARCHAR(50) NOT NULL,
    "sensor_name" VARCHAR(200) NOT NULL,
    "serial_number" VARCHAR(150),
    "manufacturer" VARCHAR(150),
    "protocol" VARCHAR(50),
    "connection_address" VARCHAR(255),
    "data_topic" VARCHAR(255),
    "sampling_interval_seconds" INTEGER,
    "last_connected_at" TIMESTAMP(3),
    "ingest_token_hash" VARCHAR(64),
    "installation_date" DATE,
    "last_calibration_date" DATE,
    "next_calibration_date" DATE,
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensor_pkey" PRIMARY KEY ("sensor_id")
);

-- CreateTable
CREATE TABLE "sensor_data" (
    "sensor_data_id" BIGSERIAL NOT NULL,
    "sensor_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "raw_value" DECIMAL(18,6) NOT NULL,
    "processed_value" DECIMAL(18,6),
    "quality_status" VARCHAR(30) NOT NULL DEFAULT 'VALID',
    "measured_at" TIMESTAMP(3) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_data_pkey" PRIMARY KEY ("sensor_data_id")
);

-- CreateTable
CREATE TABLE "carbon_result" (
    "carbon_id" BIGSERIAL NOT NULL,
    "usage_id" BIGINT NOT NULL,
    "factor_id" INTEGER NOT NULL,
    "quantity_used" DECIMAL(18,6) NOT NULL,
    "factor_used" DECIMAL(18,6) NOT NULL,
    "carbon_value" DECIMAL(18,6) NOT NULL,
    "carbon_unit" VARCHAR(50) NOT NULL,
    "scope" VARCHAR(30) NOT NULL,
    "calculation_status" VARCHAR(30) NOT NULL DEFAULT 'CALCULATED',
    "calculation_version" VARCHAR(50) NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carbon_result_pkey" PRIMARY KEY ("carbon_id")
);

-- CreateTable
CREATE TABLE "kpi" (
    "kpi_id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "factory_id" INTEGER,
    "building_id" INTEGER,
    "department_id" INTEGER,
    "line_id" INTEGER,
    "machine_id" INTEGER,
    "resource_type_id" INTEGER,
    "unit_id" INTEGER NOT NULL,
    "kpi_code" VARCHAR(50) NOT NULL,
    "kpi_name" VARCHAR(200) NOT NULL,
    "kpi_type" VARCHAR(100) NOT NULL,
    "scope_type" VARCHAR(50) NOT NULL,
    "target_value" DECIMAL(18,6) NOT NULL,
    "target_operator" VARCHAR(20) NOT NULL,
    "period_type" VARCHAR(30) NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_pkey" PRIMARY KEY ("kpi_id")
);

-- CreateTable
CREATE TABLE "kpi_result" (
    "result_id" BIGSERIAL NOT NULL,
    "kpi_id" INTEGER NOT NULL,
    "actual_value" DECIMAL(18,6) NOT NULL,
    "variance_value" DECIMAL(18,6) NOT NULL,
    "achievement_percent" DECIMAL(18,4) NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "result_status" VARCHAR(30) NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_result_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "alert" (
    "alert_id" BIGSERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "factory_id" INTEGER,
    "building_id" INTEGER,
    "department_id" INTEGER,
    "line_id" INTEGER,
    "machine_id" INTEGER,
    "usage_id" BIGINT,
    "kpi_result_id" BIGINT,
    "resolved_by" INTEGER,
    "alert_code" VARCHAR(100) NOT NULL,
    "alert_type" VARCHAR(100) NOT NULL,
    "severity" VARCHAR(30) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "threshold_value" DECIMAL(18,6),
    "actual_value" DECIMAL(18,6),
    "status" VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_pkey" PRIMARY KEY ("alert_id")
);

-- CreateTable
CREATE TABLE "ai_recommendation" (
    "recommendation_id" BIGSERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "factory_id" INTEGER,
    "building_id" INTEGER,
    "department_id" INTEGER,
    "line_id" INTEGER,
    "machine_id" INTEGER,
    "usage_id" BIGINT,
    "kpi_result_id" BIGINT,
    "alert_id" BIGINT,
    "reviewed_by" INTEGER,
    "recommendation_type" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "estimated_cost_saving" DECIMAL(18,4),
    "estimated_energy_saving" DECIMAL(18,4),
    "estimated_carbon_saving" DECIMAL(18,4),
    "priority" INTEGER NOT NULL DEFAULT 3,
    "confidence_score" DECIMAL(5,4),
    "review_status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "implementation_status" VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED',
    "reviewed_at" TIMESTAMP(3),
    "implemented_at" TIMESTAMP(3),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_recommendation_pkey" PRIMARY KEY ("recommendation_id")
);

-- CreateTable
CREATE TABLE "report" (
    "report_id" BIGSERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "factory_id" INTEGER,
    "generated_by" INTEGER NOT NULL,
    "report_name" VARCHAR(255) NOT NULL,
    "report_type" VARCHAR(100) NOT NULL,
    "report_format" VARCHAR(30) NOT NULL,
    "filter_scope" VARCHAR(500),
    "period_start" DATE,
    "period_end" DATE,
    "report_status" VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    "file_path" VARCHAR(500),
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generated_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "backup_record" (
    "backup_id" SERIAL NOT NULL,
    "backup_code" VARCHAR(100) NOT NULL,
    "backup_type" VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    "backup_scope" VARCHAR(30) NOT NULL DEFAULT 'FULL',
    "storage_type" VARCHAR(30) NOT NULL DEFAULT 'LOCAL',
    "file_name" VARCHAR(255),
    "file_path" VARCHAR(1000),
    "file_size" BIGINT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'RUNNING',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "created_by_user_id" INTEGER,
    "created_by_name" VARCHAR(200),
    "error_message" TEXT,
    "restored_at" TIMESTAMP(3),
    "restored_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backup_record_pkey" PRIMARY KEY ("backup_id")
);

-- CreateTable
CREATE TABLE "system_setting" (
    "system_setting_id" SERIAL NOT NULL,
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
    "force_mfa" BOOLEAN NOT NULL DEFAULT false,
    "ip_protection" BOOLEAN NOT NULL DEFAULT true,
    "anomaly_detection" BOOLEAN NOT NULL DEFAULT true,
    "auto_block" BOOLEAN NOT NULL DEFAULT true,
    "session_timeout_minutes" INTEGER NOT NULL DEFAULT 60,
    "max_login_attempts" INTEGER NOT NULL DEFAULT 5,
    "audit_retention_days" INTEGER NOT NULL DEFAULT 365,
    "login_retention_days" INTEGER NOT NULL DEFAULT 180,
    "backup_frequency" VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    "carbon_analytics_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sensor_monitoring_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ai_recommendations_enabled" BOOLEAN NOT NULL DEFAULT false,
    "machine_qr_enabled" BOOLEAN NOT NULL DEFAULT true,
    "report_builder_enabled" BOOLEAN NOT NULL DEFAULT false,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_setting_pkey" PRIMARY KEY ("system_setting_id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "ticket_id" SERIAL NOT NULL,
    "ticket_reference" VARCHAR(50) NOT NULL,
    "reporter_id" INTEGER NOT NULL,
    "company_id" INTEGER,
    "subject" VARCHAR(150) NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "priority" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "page_url" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "password_reset_token" (
    "reset_token_id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("reset_token_id")
);

-- CreateTable
CREATE TABLE "manager_chat_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "transcript" JSONB NOT NULL,
    "mode" VARCHAR(20) NOT NULL DEFAULT 'general',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_chat_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_company_code_key" ON "company"("company_code");

-- CreateIndex
CREATE INDEX "company_status_idx" ON "company"("status");

-- CreateIndex
CREATE INDEX "company_company_name_idx" ON "company"("company_name");

-- CreateIndex
CREATE INDEX "factory_company_id_idx" ON "factory"("company_id");

-- CreateIndex
CREATE INDEX "factory_status_idx" ON "factory"("status");

-- CreateIndex
CREATE INDEX "factory_factory_name_idx" ON "factory"("factory_name");

-- CreateIndex
CREATE UNIQUE INDEX "factory_company_id_factory_code_key" ON "factory"("company_id", "factory_code");

-- CreateIndex
CREATE INDEX "building_factory_id_idx" ON "building"("factory_id");

-- CreateIndex
CREATE INDEX "building_status_idx" ON "building"("status");

-- CreateIndex
CREATE INDEX "building_building_name_idx" ON "building"("building_name");

-- CreateIndex
CREATE UNIQUE INDEX "building_factory_id_building_code_key" ON "building"("factory_id", "building_code");

-- CreateIndex
CREATE INDEX "department_building_id_idx" ON "department"("building_id");

-- CreateIndex
CREATE INDEX "department_status_idx" ON "department"("status");

-- CreateIndex
CREATE INDEX "department_department_name_idx" ON "department"("department_name");

-- CreateIndex
CREATE UNIQUE INDEX "department_building_id_department_code_key" ON "department"("building_id", "department_code");

-- CreateIndex
CREATE INDEX "production_line_department_id_idx" ON "production_line"("department_id");

-- CreateIndex
CREATE INDEX "production_line_status_idx" ON "production_line"("status");

-- CreateIndex
CREATE INDEX "production_line_line_name_idx" ON "production_line"("line_name");

-- CreateIndex
CREATE UNIQUE INDEX "production_line_department_id_line_code_key" ON "production_line"("department_id", "line_code");

-- CreateIndex
CREATE UNIQUE INDEX "role_role_code_key" ON "role"("role_code");

-- CreateIndex
CREATE UNIQUE INDEX "role_role_name_key" ON "role"("role_name");

-- CreateIndex
CREATE INDEX "role_status_idx" ON "role"("status");

-- CreateIndex
CREATE UNIQUE INDEX "permission_permission_code_key" ON "permission"("permission_code");

-- CreateIndex
CREATE INDEX "permission_group_code_idx" ON "permission"("group_code");

-- CreateIndex
CREATE INDEX "permission_status_idx" ON "permission"("status");

-- CreateIndex
CREATE INDEX "permission_sort_order_idx" ON "permission"("sort_order");

-- CreateIndex
CREATE INDEX "role_permission_role_id_idx" ON "role_permission"("role_id");

-- CreateIndex
CREATE INDEX "role_permission_permission_id_idx" ON "role_permission"("permission_id");

-- CreateIndex
CREATE INDEX "role_permission_permission_level_idx" ON "role_permission"("permission_level");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_role_id_permission_id_key" ON "role_permission"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_company_id_idx" ON "user"("company_id");

-- CreateIndex
CREATE INDEX "user_factory_id_idx" ON "user"("factory_id");

-- CreateIndex
CREATE INDEX "user_department_id_idx" ON "user"("department_id");

-- CreateIndex
CREATE INDEX "user_role_id_idx" ON "user"("role_id");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");

-- CreateIndex
CREATE INDEX "user_company_id_role_id_idx" ON "user"("company_id", "role_id");

-- CreateIndex
CREATE INDEX "user_factory_id_role_id_idx" ON "user"("factory_id", "role_id");

-- CreateIndex
CREATE INDEX "user_department_id_role_id_idx" ON "user"("department_id", "role_id");

-- CreateIndex
CREATE INDEX "login_log_user_id_login_at_idx" ON "login_log"("user_id", "login_at");

-- CreateIndex
CREATE INDEX "login_log_attempted_email_login_at_idx" ON "login_log"("attempted_email", "login_at");

-- CreateIndex
CREATE INDEX "login_log_login_status_idx" ON "login_log"("login_status");

-- CreateIndex
CREATE INDEX "audit_log_user_id_created_at_idx" ON "audit_log"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_log_table_name_record_id_idx" ON "audit_log"("table_name", "record_id");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");

-- CreateIndex
CREATE INDEX "notification_user_id_is_read_created_at_idx" ON "notification"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "notification_alert_id_idx" ON "notification"("alert_id");

-- CreateIndex
CREATE INDEX "notification_priority_idx" ON "notification"("priority");

-- CreateIndex
CREATE INDEX "notification_notification_type_idx" ON "notification"("notification_type");

-- CreateIndex
CREATE UNIQUE INDEX "machine_type_machine_type_code_key" ON "machine_type"("machine_type_code");

-- CreateIndex
CREATE INDEX "machine_type_status_idx" ON "machine_type"("status");

-- CreateIndex
CREATE INDEX "machine_type_machine_type_name_idx" ON "machine_type"("machine_type_name");

-- CreateIndex
CREATE UNIQUE INDEX "sensor_type_sensor_type_code_key" ON "sensor_type"("sensor_type_code");

-- CreateIndex
CREATE INDEX "sensor_type_status_idx" ON "sensor_type"("status");

-- CreateIndex
CREATE INDEX "sensor_type_sensor_type_name_idx" ON "sensor_type"("sensor_type_name");

-- CreateIndex
CREATE UNIQUE INDEX "unit_unit_code_key" ON "unit"("unit_code");

-- CreateIndex
CREATE INDEX "unit_status_idx" ON "unit"("status");

-- CreateIndex
CREATE INDEX "unit_unit_type_idx" ON "unit"("unit_type");

-- CreateIndex
CREATE UNIQUE INDEX "resource_category_category_code_key" ON "resource_category"("category_code");

-- CreateIndex
CREATE INDEX "resource_category_status_idx" ON "resource_category"("status");

-- CreateIndex
CREATE INDEX "resource_category_category_name_idx" ON "resource_category"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "resource_type_resource_code_key" ON "resource_type"("resource_code");

-- CreateIndex
CREATE INDEX "resource_type_category_id_idx" ON "resource_type"("category_id");

-- CreateIndex
CREATE INDEX "resource_type_default_unit_id_idx" ON "resource_type"("default_unit_id");

-- CreateIndex
CREATE INDEX "resource_type_status_idx" ON "resource_type"("status");

-- CreateIndex
CREATE INDEX "resource_type_resource_name_idx" ON "resource_type"("resource_name");

-- CreateIndex
CREATE INDEX "resource_type_carbon_calculable_idx" ON "resource_type"("carbon_calculable");

-- CreateIndex
CREATE INDEX "emission_factor_resource_type_id_idx" ON "emission_factor"("resource_type_id");

-- CreateIndex
CREATE INDEX "emission_factor_status_idx" ON "emission_factor"("status");

-- CreateIndex
CREATE INDEX "emission_factor_effective_date_idx" ON "emission_factor"("effective_date");

-- CreateIndex
CREATE INDEX "emission_factor_expiry_date_idx" ON "emission_factor"("expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "resource_usage_usage_reference_key" ON "resource_usage"("usage_reference");

-- CreateIndex
CREATE INDEX "resource_usage_company_id_usage_at_idx" ON "resource_usage"("company_id", "usage_at");

-- CreateIndex
CREATE INDEX "resource_usage_factory_id_usage_at_idx" ON "resource_usage"("factory_id", "usage_at");

-- CreateIndex
CREATE INDEX "resource_usage_building_id_usage_at_idx" ON "resource_usage"("building_id", "usage_at");

-- CreateIndex
CREATE INDEX "resource_usage_department_id_usage_at_idx" ON "resource_usage"("department_id", "usage_at");

-- CreateIndex
CREATE INDEX "resource_usage_line_id_usage_at_idx" ON "resource_usage"("line_id", "usage_at");

-- CreateIndex
CREATE INDEX "resource_usage_machine_id_usage_at_idx" ON "resource_usage"("machine_id", "usage_at");

-- CreateIndex
CREATE INDEX "resource_usage_checkpoint_id_usage_at_idx" ON "resource_usage"("checkpoint_id", "usage_at");

-- CreateIndex
CREATE INDEX "resource_usage_resource_type_id_usage_at_idx" ON "resource_usage"("resource_type_id", "usage_at");

-- CreateIndex
CREATE INDEX "resource_usage_unit_id_idx" ON "resource_usage"("unit_id");

-- CreateIndex
CREATE INDEX "resource_usage_sensor_data_id_idx" ON "resource_usage"("sensor_data_id");

-- CreateIndex
CREATE INDEX "resource_usage_qr_scan_id_idx" ON "resource_usage"("qr_scan_id");

-- CreateIndex
CREATE INDEX "resource_usage_recorded_by_usage_at_idx" ON "resource_usage"("recorded_by", "usage_at");

-- CreateIndex
CREATE INDEX "resource_usage_scope_type_idx" ON "resource_usage"("scope_type");

-- CreateIndex
CREATE INDEX "resource_usage_source_type_idx" ON "resource_usage"("source_type");

-- CreateIndex
CREATE INDEX "resource_usage_processing_status_idx" ON "resource_usage"("processing_status");

-- CreateIndex
CREATE INDEX "resource_usage_status_idx" ON "resource_usage"("status");

-- CreateIndex
CREATE INDEX "machine_line_id_idx" ON "machine"("line_id");

-- CreateIndex
CREATE INDEX "machine_machine_type_id_idx" ON "machine"("machine_type_id");

-- CreateIndex
CREATE INDEX "machine_machine_name_idx" ON "machine"("machine_name");

-- CreateIndex
CREATE INDEX "machine_operational_status_idx" ON "machine"("operational_status");

-- CreateIndex
CREATE INDEX "machine_status_idx" ON "machine"("status");

-- CreateIndex
CREATE UNIQUE INDEX "machine_line_id_machine_code_key" ON "machine"("line_id", "machine_code");

-- CreateIndex
CREATE INDEX "checkpoint_line_id_idx" ON "checkpoint"("line_id");

-- CreateIndex
CREATE INDEX "checkpoint_status_idx" ON "checkpoint"("status");

-- CreateIndex
CREATE INDEX "checkpoint_checkpoint_name_idx" ON "checkpoint"("checkpoint_name");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoint_line_id_checkpoint_code_key" ON "checkpoint"("line_id", "checkpoint_code");

-- CreateIndex
CREATE UNIQUE INDEX "qr_code_qr_token_key" ON "qr_code"("qr_token");

-- CreateIndex
CREATE INDEX "qr_code_machine_id_idx" ON "qr_code"("machine_id");

-- CreateIndex
CREATE INDEX "qr_code_checkpoint_id_idx" ON "qr_code"("checkpoint_id");

-- CreateIndex
CREATE INDEX "qr_code_qr_status_idx" ON "qr_code"("qr_status");

-- CreateIndex
CREATE INDEX "qr_scan_log_qr_id_scanned_at_idx" ON "qr_scan_log"("qr_id", "scanned_at");

-- CreateIndex
CREATE INDEX "qr_scan_log_user_id_scanned_at_idx" ON "qr_scan_log"("user_id", "scanned_at");

-- CreateIndex
CREATE INDEX "qr_scan_log_scan_result_idx" ON "qr_scan_log"("scan_result");

-- CreateIndex
CREATE UNIQUE INDEX "sensor_ingest_token_hash_key" ON "sensor"("ingest_token_hash");

-- CreateIndex
CREATE INDEX "sensor_machine_id_idx" ON "sensor"("machine_id");

-- CreateIndex
CREATE INDEX "sensor_sensor_type_id_idx" ON "sensor"("sensor_type_id");

-- CreateIndex
CREATE INDEX "sensor_status_idx" ON "sensor"("status");

-- CreateIndex
CREATE INDEX "sensor_last_connected_at_idx" ON "sensor"("last_connected_at");

-- CreateIndex
CREATE INDEX "sensor_sensor_name_idx" ON "sensor"("sensor_name");

-- CreateIndex
CREATE UNIQUE INDEX "sensor_machine_id_sensor_code_key" ON "sensor"("machine_id", "sensor_code");

-- CreateIndex
CREATE INDEX "sensor_data_sensor_id_measured_at_idx" ON "sensor_data"("sensor_id", "measured_at");

-- CreateIndex
CREATE INDEX "sensor_data_unit_id_idx" ON "sensor_data"("unit_id");

-- CreateIndex
CREATE INDEX "sensor_data_quality_status_idx" ON "sensor_data"("quality_status");

-- CreateIndex
CREATE INDEX "sensor_data_measured_at_idx" ON "sensor_data"("measured_at");

-- CreateIndex
CREATE UNIQUE INDEX "carbon_result_usage_id_key" ON "carbon_result"("usage_id");

-- CreateIndex
CREATE INDEX "carbon_result_usage_id_idx" ON "carbon_result"("usage_id");

-- CreateIndex
CREATE INDEX "carbon_result_factor_id_idx" ON "carbon_result"("factor_id");

-- CreateIndex
CREATE INDEX "carbon_result_scope_idx" ON "carbon_result"("scope");

-- CreateIndex
CREATE INDEX "carbon_result_calculation_status_idx" ON "carbon_result"("calculation_status");

-- CreateIndex
CREATE INDEX "carbon_result_calculated_at_idx" ON "carbon_result"("calculated_at");

-- CreateIndex
CREATE INDEX "kpi_factory_id_idx" ON "kpi"("factory_id");

-- CreateIndex
CREATE INDEX "kpi_building_id_idx" ON "kpi"("building_id");

-- CreateIndex
CREATE INDEX "kpi_department_id_idx" ON "kpi"("department_id");

-- CreateIndex
CREATE INDEX "kpi_line_id_idx" ON "kpi"("line_id");

-- CreateIndex
CREATE INDEX "kpi_machine_id_idx" ON "kpi"("machine_id");

-- CreateIndex
CREATE INDEX "kpi_resource_type_id_idx" ON "kpi"("resource_type_id");

-- CreateIndex
CREATE INDEX "kpi_unit_id_idx" ON "kpi"("unit_id");

-- CreateIndex
CREATE INDEX "kpi_scope_type_idx" ON "kpi"("scope_type");

-- CreateIndex
CREATE INDEX "kpi_period_type_idx" ON "kpi"("period_type");

-- CreateIndex
CREATE INDEX "kpi_status_idx" ON "kpi"("status");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_company_id_kpi_code_key" ON "kpi"("company_id", "kpi_code");

-- CreateIndex
CREATE INDEX "kpi_result_kpi_id_calculated_at_idx" ON "kpi_result"("kpi_id", "calculated_at");

-- CreateIndex
CREATE INDEX "kpi_result_result_status_idx" ON "kpi_result"("result_status");

-- CreateIndex
CREATE INDEX "kpi_result_period_start_period_end_idx" ON "kpi_result"("period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_result_kpi_id_period_start_period_end_key" ON "kpi_result"("kpi_id", "period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "alert_alert_code_key" ON "alert"("alert_code");

-- CreateIndex
CREATE INDEX "alert_company_id_triggered_at_idx" ON "alert"("company_id", "triggered_at");

-- CreateIndex
CREATE INDEX "alert_factory_id_triggered_at_idx" ON "alert"("factory_id", "triggered_at");

-- CreateIndex
CREATE INDEX "alert_building_id_idx" ON "alert"("building_id");

-- CreateIndex
CREATE INDEX "alert_department_id_idx" ON "alert"("department_id");

-- CreateIndex
CREATE INDEX "alert_line_id_idx" ON "alert"("line_id");

-- CreateIndex
CREATE INDEX "alert_machine_id_idx" ON "alert"("machine_id");

-- CreateIndex
CREATE INDEX "alert_usage_id_idx" ON "alert"("usage_id");

-- CreateIndex
CREATE INDEX "alert_kpi_result_id_idx" ON "alert"("kpi_result_id");

-- CreateIndex
CREATE INDEX "alert_resolved_by_idx" ON "alert"("resolved_by");

-- CreateIndex
CREATE INDEX "alert_severity_idx" ON "alert"("severity");

-- CreateIndex
CREATE INDEX "alert_status_idx" ON "alert"("status");

-- CreateIndex
CREATE INDEX "ai_recommendation_company_id_created_at_idx" ON "ai_recommendation"("company_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_recommendation_factory_id_created_at_idx" ON "ai_recommendation"("factory_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_recommendation_building_id_idx" ON "ai_recommendation"("building_id");

-- CreateIndex
CREATE INDEX "ai_recommendation_department_id_idx" ON "ai_recommendation"("department_id");

-- CreateIndex
CREATE INDEX "ai_recommendation_line_id_idx" ON "ai_recommendation"("line_id");

-- CreateIndex
CREATE INDEX "ai_recommendation_machine_id_idx" ON "ai_recommendation"("machine_id");

-- CreateIndex
CREATE INDEX "ai_recommendation_usage_id_idx" ON "ai_recommendation"("usage_id");

-- CreateIndex
CREATE INDEX "ai_recommendation_kpi_result_id_idx" ON "ai_recommendation"("kpi_result_id");

-- CreateIndex
CREATE INDEX "ai_recommendation_alert_id_idx" ON "ai_recommendation"("alert_id");

-- CreateIndex
CREATE INDEX "ai_recommendation_reviewed_by_idx" ON "ai_recommendation"("reviewed_by");

-- CreateIndex
CREATE INDEX "ai_recommendation_priority_idx" ON "ai_recommendation"("priority");

-- CreateIndex
CREATE INDEX "ai_recommendation_review_status_idx" ON "ai_recommendation"("review_status");

-- CreateIndex
CREATE INDEX "ai_recommendation_implementation_status_idx" ON "ai_recommendation"("implementation_status");

-- CreateIndex
CREATE INDEX "ai_recommendation_status_idx" ON "ai_recommendation"("status");

-- CreateIndex
CREATE INDEX "report_company_id_requested_at_idx" ON "report"("company_id", "requested_at");

-- CreateIndex
CREATE INDEX "report_factory_id_requested_at_idx" ON "report"("factory_id", "requested_at");

-- CreateIndex
CREATE INDEX "report_generated_by_requested_at_idx" ON "report"("generated_by", "requested_at");

-- CreateIndex
CREATE INDEX "report_report_type_idx" ON "report"("report_type");

-- CreateIndex
CREATE INDEX "report_report_format_idx" ON "report"("report_format");

-- CreateIndex
CREATE INDEX "report_report_status_idx" ON "report"("report_status");

-- CreateIndex
CREATE INDEX "report_expires_at_idx" ON "report"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "backup_record_backup_code_key" ON "backup_record"("backup_code");

-- CreateIndex
CREATE INDEX "backup_record_status_idx" ON "backup_record"("status");

-- CreateIndex
CREATE INDEX "backup_record_backup_type_idx" ON "backup_record"("backup_type");

-- CreateIndex
CREATE INDEX "backup_record_created_at_idx" ON "backup_record"("created_at");

-- CreateIndex
CREATE INDEX "backup_record_created_by_user_id_idx" ON "backup_record"("created_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticket_reference_key" ON "support_tickets"("ticket_reference");

-- CreateIndex
CREATE INDEX "support_tickets_reporter_id_idx" ON "support_tickets"("reporter_id");

-- CreateIndex
CREATE INDEX "support_tickets_company_id_idx" ON "support_tickets"("company_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_created_at_idx" ON "support_tickets"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_token_hash_key" ON "password_reset_token"("token_hash");

-- CreateIndex
CREATE INDEX "idx_password_reset_user" ON "password_reset_token"("user_id");

-- CreateIndex
CREATE INDEX "idx_password_reset_expires" ON "password_reset_token"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "manager_chat_history_user_id_company_id_key" ON "manager_chat_history"("user_id", "company_id");

-- AddForeignKey
ALTER TABLE "factory" ADD CONSTRAINT "factory_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "building" ADD CONSTRAINT "building_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factory"("factory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "building"("building_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_line" ADD CONSTRAINT "production_line_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factory"("factory_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_log" ADD CONSTRAINT "login_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alert"("alert_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_type" ADD CONSTRAINT "resource_type_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "resource_category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_type" ADD CONSTRAINT "resource_type_default_unit_id_fkey" FOREIGN KEY ("default_unit_id") REFERENCES "unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emission_factor" ADD CONSTRAINT "emission_factor_resource_type_id_fkey" FOREIGN KEY ("resource_type_id") REFERENCES "resource_type"("resource_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factory"("factory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "building"("building_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "production_line"("line_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machine"("machine_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoint"("checkpoint_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_resource_type_id_fkey" FOREIGN KEY ("resource_type_id") REFERENCES "resource_type"("resource_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_sensor_data_id_fkey" FOREIGN KEY ("sensor_data_id") REFERENCES "sensor_data"("sensor_data_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_qr_scan_id_fkey" FOREIGN KEY ("qr_scan_id") REFERENCES "qr_scan_log"("scan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage" ADD CONSTRAINT "resource_usage_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine" ADD CONSTRAINT "machine_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "production_line"("line_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine" ADD CONSTRAINT "machine_machine_type_id_fkey" FOREIGN KEY ("machine_type_id") REFERENCES "machine_type"("machine_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkpoint" ADD CONSTRAINT "checkpoint_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "production_line"("line_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machine"("machine_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoint"("checkpoint_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_log" ADD CONSTRAINT "qr_scan_log_qr_id_fkey" FOREIGN KEY ("qr_id") REFERENCES "qr_code"("qr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_log" ADD CONSTRAINT "qr_scan_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor" ADD CONSTRAINT "sensor_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machine"("machine_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor" ADD CONSTRAINT "sensor_sensor_type_id_fkey" FOREIGN KEY ("sensor_type_id") REFERENCES "sensor_type"("sensor_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_data" ADD CONSTRAINT "sensor_data_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensor"("sensor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_data" ADD CONSTRAINT "sensor_data_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_result" ADD CONSTRAINT "carbon_result_usage_id_fkey" FOREIGN KEY ("usage_id") REFERENCES "resource_usage"("usage_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_result" ADD CONSTRAINT "carbon_result_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "emission_factor"("factor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi" ADD CONSTRAINT "kpi_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi" ADD CONSTRAINT "kpi_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factory"("factory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi" ADD CONSTRAINT "kpi_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "building"("building_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi" ADD CONSTRAINT "kpi_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi" ADD CONSTRAINT "kpi_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "production_line"("line_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi" ADD CONSTRAINT "kpi_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machine"("machine_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi" ADD CONSTRAINT "kpi_resource_type_id_fkey" FOREIGN KEY ("resource_type_id") REFERENCES "resource_type"("resource_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi" ADD CONSTRAINT "kpi_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_result" ADD CONSTRAINT "kpi_result_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "kpi"("kpi_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factory"("factory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "building"("building_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "production_line"("line_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machine"("machine_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_usage_id_fkey" FOREIGN KEY ("usage_id") REFERENCES "resource_usage"("usage_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_kpi_result_id_fkey" FOREIGN KEY ("kpi_result_id") REFERENCES "kpi_result"("result_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation" ADD CONSTRAINT "ai_recommendation_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation" ADD CONSTRAINT "ai_recommendation_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factory"("factory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation" ADD CONSTRAINT "ai_recommendation_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "building"("building_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation" ADD CONSTRAINT "ai_recommendation_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation" ADD CONSTRAINT "ai_recommendation_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "production_line"("line_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation" ADD CONSTRAINT "ai_recommendation_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machine"("machine_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation" ADD CONSTRAINT "ai_recommendation_usage_id_fkey" FOREIGN KEY ("usage_id") REFERENCES "resource_usage"("usage_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation" ADD CONSTRAINT "ai_recommendation_kpi_result_id_fkey" FOREIGN KEY ("kpi_result_id") REFERENCES "kpi_result"("result_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation" ADD CONSTRAINT "ai_recommendation_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alert"("alert_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation" ADD CONSTRAINT "ai_recommendation_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factory"("factory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

