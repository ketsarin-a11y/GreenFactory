/*
  Warnings:

  - You are about to drop the column `failed_login` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `password_reset_token` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[role_code]` on the table `role` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `password_reset_token` DROP FOREIGN KEY `password_reset_token_user_id_fkey`;

-- AlterTable
ALTER TABLE `role` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `role_code` VARCHAR(50) NULL,
    ADD COLUMN `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` DROP COLUMN `failed_login`,
    DROP COLUMN `last_login`,
    ADD COLUMN `failed_login_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `last_login_at` DATETIME(3) NULL,
    ADD COLUMN `password_changed_at` DATETIME(3) NULL,
    ADD COLUMN `password_expires_at` DATETIME(3) NULL,
    ADD COLUMN `profile_image_path` VARCHAR(500) NULL;

-- DropTable
DROP TABLE `password_reset_token`;

-- CreateTable
CREATE TABLE `permission` (
    `permission_id` INTEGER NOT NULL AUTO_INCREMENT,
    `permission_code` VARCHAR(100) NOT NULL,
    `permission_name` VARCHAR(150) NOT NULL,
    `group_code` VARCHAR(100) NOT NULL,
    `group_name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(500) NULL,
    `icon` VARCHAR(50) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `permission_permission_code_key`(`permission_code`),
    INDEX `permission_group_code_idx`(`group_code`),
    INDEX `permission_status_idx`(`status`),
    INDEX `permission_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permission` (
    `role_permission_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,
    `permission_level` VARCHAR(20) NOT NULL DEFAULT 'NONE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `role_permission_role_id_idx`(`role_id`),
    INDEX `role_permission_permission_id_idx`(`permission_id`),
    INDEX `role_permission_permission_level_idx`(`permission_level`),
    UNIQUE INDEX `role_permission_role_id_permission_id_key`(`role_id`, `permission_id`),
    PRIMARY KEY (`role_permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_log` (
    `login_log_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `attempted_email` VARCHAR(255) NULL,
    `login_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `logout_at` DATETIME(3) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `device` VARCHAR(150) NULL,
    `login_method` VARCHAR(50) NULL,
    `login_status` VARCHAR(30) NOT NULL,
    `failure_reason` VARCHAR(500) NULL,

    INDEX `login_log_user_id_login_at_idx`(`user_id`, `login_at`),
    INDEX `login_log_attempted_email_login_at_idx`(`attempted_email`, `login_at`),
    INDEX `login_log_login_status_idx`(`login_status`),
    PRIMARY KEY (`login_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `audit_log_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `table_name` VARCHAR(100) NOT NULL,
    `record_id` BIGINT NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `old_data` JSON NULL,
    `new_data` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_log_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `audit_log_table_name_record_id_idx`(`table_name`, `record_id`),
    INDEX `audit_log_action_idx`(`action`),
    INDEX `audit_log_created_at_idx`(`created_at`),
    PRIMARY KEY (`audit_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `notification_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `alert_id` BIGINT NULL,
    `notification_type` VARCHAR(50) NOT NULL,
    `priority` VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    `title` VARCHAR(255) NOT NULL,
    `message` VARCHAR(1000) NOT NULL,
    `action_url` VARCHAR(500) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_user_id_is_read_created_at_idx`(`user_id`, `is_read`, `created_at`),
    INDEX `notification_alert_id_idx`(`alert_id`),
    INDEX `notification_priority_idx`(`priority`),
    INDEX `notification_notification_type_idx`(`notification_type`),
    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpi` (
    `kpi_id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `factory_id` INTEGER NULL,
    `building_id` INTEGER NULL,
    `department_id` INTEGER NULL,
    `line_id` INTEGER NULL,
    `machine_id` INTEGER NULL,
    `resource_type_id` INTEGER NULL,
    `unit_id` INTEGER NOT NULL,
    `kpi_code` VARCHAR(50) NOT NULL,
    `kpi_name` VARCHAR(200) NOT NULL,
    `kpi_type` VARCHAR(100) NOT NULL,
    `scope_type` VARCHAR(50) NOT NULL,
    `target_value` DECIMAL(18, 6) NOT NULL,
    `target_operator` VARCHAR(20) NOT NULL,
    `period_type` VARCHAR(30) NOT NULL,
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `kpi_factory_id_idx`(`factory_id`),
    INDEX `kpi_building_id_idx`(`building_id`),
    INDEX `kpi_department_id_idx`(`department_id`),
    INDEX `kpi_line_id_idx`(`line_id`),
    INDEX `kpi_machine_id_idx`(`machine_id`),
    INDEX `kpi_resource_type_id_idx`(`resource_type_id`),
    INDEX `kpi_unit_id_idx`(`unit_id`),
    INDEX `kpi_scope_type_idx`(`scope_type`),
    INDEX `kpi_period_type_idx`(`period_type`),
    INDEX `kpi_status_idx`(`status`),
    UNIQUE INDEX `kpi_company_id_kpi_code_key`(`company_id`, `kpi_code`),
    PRIMARY KEY (`kpi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpi_result` (
    `result_id` BIGINT NOT NULL AUTO_INCREMENT,
    `kpi_id` INTEGER NOT NULL,
    `actual_value` DECIMAL(18, 6) NOT NULL,
    `variance_value` DECIMAL(18, 6) NOT NULL,
    `achievement_percent` DECIMAL(18, 4) NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `result_status` VARCHAR(30) NOT NULL,
    `calculated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `kpi_result_kpi_id_calculated_at_idx`(`kpi_id`, `calculated_at`),
    INDEX `kpi_result_result_status_idx`(`result_status`),
    INDEX `kpi_result_period_start_period_end_idx`(`period_start`, `period_end`),
    UNIQUE INDEX `kpi_result_kpi_id_period_start_period_end_key`(`kpi_id`, `period_start`, `period_end`),
    PRIMARY KEY (`result_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alert` (
    `alert_id` BIGINT NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `factory_id` INTEGER NULL,
    `building_id` INTEGER NULL,
    `department_id` INTEGER NULL,
    `line_id` INTEGER NULL,
    `machine_id` INTEGER NULL,
    `usage_id` BIGINT NULL,
    `kpi_result_id` BIGINT NULL,
    `resolved_by` INTEGER NULL,
    `alert_code` VARCHAR(100) NOT NULL,
    `alert_type` VARCHAR(100) NOT NULL,
    `severity` VARCHAR(30) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` VARCHAR(1000) NOT NULL,
    `threshold_value` DECIMAL(18, 6) NULL,
    `actual_value` DECIMAL(18, 6) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    `triggered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acknowledged_at` DATETIME(3) NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `alert_alert_code_key`(`alert_code`),
    INDEX `alert_company_id_triggered_at_idx`(`company_id`, `triggered_at`),
    INDEX `alert_factory_id_triggered_at_idx`(`factory_id`, `triggered_at`),
    INDEX `alert_building_id_idx`(`building_id`),
    INDEX `alert_department_id_idx`(`department_id`),
    INDEX `alert_line_id_idx`(`line_id`),
    INDEX `alert_machine_id_idx`(`machine_id`),
    INDEX `alert_usage_id_idx`(`usage_id`),
    INDEX `alert_kpi_result_id_idx`(`kpi_result_id`),
    INDEX `alert_resolved_by_idx`(`resolved_by`),
    INDEX `alert_severity_idx`(`severity`),
    INDEX `alert_status_idx`(`status`),
    PRIMARY KEY (`alert_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_recommendation` (
    `recommendation_id` BIGINT NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `factory_id` INTEGER NULL,
    `building_id` INTEGER NULL,
    `department_id` INTEGER NULL,
    `line_id` INTEGER NULL,
    `machine_id` INTEGER NULL,
    `usage_id` BIGINT NULL,
    `kpi_result_id` BIGINT NULL,
    `alert_id` BIGINT NULL,
    `reviewed_by` INTEGER NULL,
    `recommendation_type` VARCHAR(100) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(2000) NOT NULL,
    `estimated_cost_saving` DECIMAL(18, 4) NULL,
    `estimated_energy_saving` DECIMAL(18, 4) NULL,
    `estimated_carbon_saving` DECIMAL(18, 4) NULL,
    `priority` INTEGER NOT NULL DEFAULT 3,
    `confidence_score` DECIMAL(5, 4) NULL,
    `review_status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `implementation_status` VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED',
    `reviewed_at` DATETIME(3) NULL,
    `implemented_at` DATETIME(3) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ai_recommendation_company_id_created_at_idx`(`company_id`, `created_at`),
    INDEX `ai_recommendation_factory_id_created_at_idx`(`factory_id`, `created_at`),
    INDEX `ai_recommendation_building_id_idx`(`building_id`),
    INDEX `ai_recommendation_department_id_idx`(`department_id`),
    INDEX `ai_recommendation_line_id_idx`(`line_id`),
    INDEX `ai_recommendation_machine_id_idx`(`machine_id`),
    INDEX `ai_recommendation_usage_id_idx`(`usage_id`),
    INDEX `ai_recommendation_kpi_result_id_idx`(`kpi_result_id`),
    INDEX `ai_recommendation_alert_id_idx`(`alert_id`),
    INDEX `ai_recommendation_reviewed_by_idx`(`reviewed_by`),
    INDEX `ai_recommendation_priority_idx`(`priority`),
    INDEX `ai_recommendation_review_status_idx`(`review_status`),
    INDEX `ai_recommendation_implementation_status_idx`(`implementation_status`),
    INDEX `ai_recommendation_status_idx`(`status`),
    PRIMARY KEY (`recommendation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report` (
    `report_id` BIGINT NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `factory_id` INTEGER NULL,
    `generated_by` INTEGER NOT NULL,
    `report_name` VARCHAR(255) NOT NULL,
    `report_type` VARCHAR(100) NOT NULL,
    `report_format` VARCHAR(30) NOT NULL,
    `filter_scope` VARCHAR(500) NULL,
    `period_start` DATE NULL,
    `period_end` DATE NULL,
    `report_status` VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    `file_path` VARCHAR(500) NULL,
    `download_count` INTEGER NOT NULL DEFAULT 0,
    `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `generated_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `report_company_id_requested_at_idx`(`company_id`, `requested_at`),
    INDEX `report_factory_id_requested_at_idx`(`factory_id`, `requested_at`),
    INDEX `report_generated_by_requested_at_idx`(`generated_by`, `requested_at`),
    INDEX `report_report_type_idx`(`report_type`),
    INDEX `report_report_format_idx`(`report_format`),
    INDEX `report_report_status_idx`(`report_status`),
    INDEX `report_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`report_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `role_role_code_key` ON `role`(`role_code`);

-- CreateIndex
CREATE INDEX `role_status_idx` ON `role`(`status`);

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`role_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permission`(`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `login_log` ADD CONSTRAINT `login_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_alert_id_fkey` FOREIGN KEY (`alert_id`) REFERENCES `alert`(`alert_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi` ADD CONSTRAINT `kpi_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi` ADD CONSTRAINT `kpi_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory`(`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi` ADD CONSTRAINT `kpi_building_id_fkey` FOREIGN KEY (`building_id`) REFERENCES `building`(`building_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi` ADD CONSTRAINT `kpi_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi` ADD CONSTRAINT `kpi_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `production_line`(`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi` ADD CONSTRAINT `kpi_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine`(`machine_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi` ADD CONSTRAINT `kpi_resource_type_id_fkey` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_type`(`resource_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi` ADD CONSTRAINT `kpi_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `unit`(`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi_result` ADD CONSTRAINT `kpi_result_kpi_id_fkey` FOREIGN KEY (`kpi_id`) REFERENCES `kpi`(`kpi_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alert` ADD CONSTRAINT `alert_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alert` ADD CONSTRAINT `alert_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory`(`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alert` ADD CONSTRAINT `alert_building_id_fkey` FOREIGN KEY (`building_id`) REFERENCES `building`(`building_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alert` ADD CONSTRAINT `alert_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alert` ADD CONSTRAINT `alert_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `production_line`(`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alert` ADD CONSTRAINT `alert_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine`(`machine_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alert` ADD CONSTRAINT `alert_usage_id_fkey` FOREIGN KEY (`usage_id`) REFERENCES `resource_usage`(`usage_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alert` ADD CONSTRAINT `alert_kpi_result_id_fkey` FOREIGN KEY (`kpi_result_id`) REFERENCES `kpi_result`(`result_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alert` ADD CONSTRAINT `alert_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_recommendation` ADD CONSTRAINT `ai_recommendation_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_recommendation` ADD CONSTRAINT `ai_recommendation_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory`(`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_recommendation` ADD CONSTRAINT `ai_recommendation_building_id_fkey` FOREIGN KEY (`building_id`) REFERENCES `building`(`building_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_recommendation` ADD CONSTRAINT `ai_recommendation_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_recommendation` ADD CONSTRAINT `ai_recommendation_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `production_line`(`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_recommendation` ADD CONSTRAINT `ai_recommendation_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine`(`machine_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_recommendation` ADD CONSTRAINT `ai_recommendation_usage_id_fkey` FOREIGN KEY (`usage_id`) REFERENCES `resource_usage`(`usage_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_recommendation` ADD CONSTRAINT `ai_recommendation_kpi_result_id_fkey` FOREIGN KEY (`kpi_result_id`) REFERENCES `kpi_result`(`result_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_recommendation` ADD CONSTRAINT `ai_recommendation_alert_id_fkey` FOREIGN KEY (`alert_id`) REFERENCES `alert`(`alert_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_recommendation` ADD CONSTRAINT `ai_recommendation_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory`(`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_generated_by_fkey` FOREIGN KEY (`generated_by`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
