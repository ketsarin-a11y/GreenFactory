-- CreateTable
CREATE TABLE `company` (
    `company_id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_code` VARCHAR(50) NOT NULL,
    `company_name` VARCHAR(200) NOT NULL,
    `tax_id` VARCHAR(30) NULL,
    `industry_type` VARCHAR(100) NULL,
    `address` VARCHAR(500) NULL,
    `province` VARCHAR(100) NULL,
    `postal_code` VARCHAR(20) NULL,
    `country` VARCHAR(100) NULL,
    `phone` VARCHAR(30) NULL,
    `email` VARCHAR(255) NULL,
    `website` VARCHAR(255) NULL,
    `logo_path` VARCHAR(500) NULL,
    `subscription_plan` VARCHAR(50) NULL,
    `carbon_standard` VARCHAR(100) NULL,
    `timezone` VARCHAR(100) NULL,
    `currency` VARCHAR(10) NULL,
    `language` VARCHAR(10) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `company_company_code_key`(`company_code`),
    INDEX `company_status_idx`(`status`),
    INDEX `company_company_name_idx`(`company_name`),
    PRIMARY KEY (`company_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `factory` (
    `factory_id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `factory_code` VARCHAR(50) NOT NULL,
    `factory_name` VARCHAR(200) NOT NULL,
    `address` VARCHAR(500) NULL,
    `province` VARCHAR(100) NULL,
    `postal_code` VARCHAR(20) NULL,
    `country` VARCHAR(100) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `google_map_url` VARCHAR(500) NULL,
    `map_zoom` INTEGER NULL,
    `layout_image_path` VARCHAR(500) NULL,
    `phone` VARCHAR(30) NULL,
    `email` VARCHAR(255) NULL,
    `timezone` VARCHAR(100) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `factory_company_id_idx`(`company_id`),
    INDEX `factory_status_idx`(`status`),
    INDEX `factory_factory_name_idx`(`factory_name`),
    UNIQUE INDEX `factory_company_id_factory_code_key`(`company_id`, `factory_code`),
    PRIMARY KEY (`factory_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `building` (
    `building_id` INTEGER NOT NULL AUTO_INCREMENT,
    `factory_id` INTEGER NOT NULL,
    `building_code` VARCHAR(50) NOT NULL,
    `building_name` VARCHAR(200) NOT NULL,
    `building_type` VARCHAR(100) NULL,
    `floor_count` INTEGER NULL,
    `layout_x` DECIMAL(18, 4) NULL,
    `layout_y` DECIMAL(18, 4) NULL,
    `layout_width` DECIMAL(18, 4) NULL,
    `layout_height` DECIMAL(18, 4) NULL,
    `layout_rotation` DECIMAL(18, 4) NULL,
    `description` VARCHAR(500) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `building_factory_id_idx`(`factory_id`),
    INDEX `building_status_idx`(`status`),
    INDEX `building_building_name_idx`(`building_name`),
    UNIQUE INDEX `building_factory_id_building_code_key`(`factory_id`, `building_code`),
    PRIMARY KEY (`building_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `department` (
    `department_id` INTEGER NOT NULL AUTO_INCREMENT,
    `building_id` INTEGER NOT NULL,
    `department_code` VARCHAR(50) NOT NULL,
    `department_name` VARCHAR(200) NOT NULL,
    `description` VARCHAR(500) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `department_building_id_idx`(`building_id`),
    INDEX `department_status_idx`(`status`),
    INDEX `department_department_name_idx`(`department_name`),
    UNIQUE INDEX `department_building_id_department_code_key`(`building_id`, `department_code`),
    PRIMARY KEY (`department_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_line` (
    `line_id` INTEGER NOT NULL AUTO_INCREMENT,
    `department_id` INTEGER NOT NULL,
    `line_code` VARCHAR(50) NOT NULL,
    `line_name` VARCHAR(200) NOT NULL,
    `description` VARCHAR(500) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `production_line_department_id_idx`(`department_id`),
    INDEX `production_line_status_idx`(`status`),
    INDEX `production_line_line_name_idx`(`line_name`),
    UNIQUE INDEX `production_line_department_id_line_code_key`(`department_id`, `line_code`),
    PRIMARY KEY (`line_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_code` VARCHAR(50) NULL,
    `role_name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `role_role_code_key`(`role_code`),
    UNIQUE INDEX `role_role_name_key`(`role_name`),
    INDEX `role_status_idx`(`status`),
    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `user` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NULL,
    `factory_id` INTEGER NULL,
    `department_id` INTEGER NULL,
    `role_id` INTEGER NOT NULL,
    `employee_code` VARCHAR(50) NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `profile_image_path` VARCHAR(500) NULL,
    `failed_login_count` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,
    `password_changed_at` DATETIME(3) NULL,
    `password_expires_at` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    `last_login_at` DATETIME(3) NULL,
    `session_version` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_username_key`(`username`),
    INDEX `user_company_id_idx`(`company_id`),
    INDEX `user_factory_id_idx`(`factory_id`),
    INDEX `user_department_id_idx`(`department_id`),
    INDEX `user_role_id_idx`(`role_id`),
    INDEX `user_status_idx`(`status`),
    INDEX `user_company_id_role_id_idx`(`company_id`, `role_id`),
    INDEX `user_factory_id_role_id_idx`(`factory_id`, `role_id`),
    INDEX `user_department_id_role_id_idx`(`department_id`, `role_id`),
    PRIMARY KEY (`user_id`)
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
CREATE TABLE `machine_type` (
    `machine_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `machine_type_code` VARCHAR(50) NOT NULL,
    `machine_type_name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(500) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `machine_type_machine_type_code_key`(`machine_type_code`),
    INDEX `machine_type_status_idx`(`status`),
    INDEX `machine_type_machine_type_name_idx`(`machine_type_name`),
    PRIMARY KEY (`machine_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensor_type` (
    `sensor_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `sensor_type_code` VARCHAR(50) NOT NULL,
    `sensor_type_name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(500) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sensor_type_sensor_type_code_key`(`sensor_type_code`),
    INDEX `sensor_type_status_idx`(`status`),
    INDEX `sensor_type_sensor_type_name_idx`(`sensor_type_name`),
    PRIMARY KEY (`sensor_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unit` (
    `unit_id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit_code` VARCHAR(50) NOT NULL,
    `unit_name` VARCHAR(100) NOT NULL,
    `symbol` VARCHAR(30) NOT NULL,
    `unit_type` VARCHAR(50) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `unit_unit_code_key`(`unit_code`),
    INDEX `unit_status_idx`(`status`),
    INDEX `unit_unit_type_idx`(`unit_type`),
    PRIMARY KEY (`unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource_category` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_code` VARCHAR(50) NOT NULL,
    `category_name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(500) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `resource_category_category_code_key`(`category_code`),
    INDEX `resource_category_status_idx`(`status`),
    INDEX `resource_category_category_name_idx`(`category_name`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource_type` (
    `resource_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `default_unit_id` INTEGER NOT NULL,
    `resource_code` VARCHAR(50) NOT NULL,
    `resource_name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(500) NULL,
    `carbon_calculable` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `resource_type_resource_code_key`(`resource_code`),
    INDEX `resource_type_category_id_idx`(`category_id`),
    INDEX `resource_type_default_unit_id_idx`(`default_unit_id`),
    INDEX `resource_type_status_idx`(`status`),
    INDEX `resource_type_resource_name_idx`(`resource_name`),
    INDEX `resource_type_carbon_calculable_idx`(`carbon_calculable`),
    PRIMARY KEY (`resource_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emission_factor` (
    `factor_id` INTEGER NOT NULL AUTO_INCREMENT,
    `resource_type_id` INTEGER NOT NULL,
    `scope` VARCHAR(30) NULL,
    `region` VARCHAR(100) NULL,
    `source` VARCHAR(255) NULL,
    `factor` DECIMAL(18, 6) NOT NULL,
    `factor_unit` VARCHAR(100) NOT NULL,
    `effective_date` DATE NOT NULL,
    `expiry_date` DATE NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `emission_factor_resource_type_id_idx`(`resource_type_id`),
    INDEX `emission_factor_status_idx`(`status`),
    INDEX `emission_factor_effective_date_idx`(`effective_date`),
    INDEX `emission_factor_expiry_date_idx`(`expiry_date`),
    PRIMARY KEY (`factor_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource_usage` (
    `usage_id` BIGINT NOT NULL AUTO_INCREMENT,
    `usage_reference` VARCHAR(100) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `factory_id` INTEGER NULL,
    `building_id` INTEGER NULL,
    `department_id` INTEGER NULL,
    `line_id` INTEGER NULL,
    `machine_id` INTEGER NULL,
    `checkpoint_id` INTEGER NULL,
    `resource_type_id` INTEGER NOT NULL,
    `unit_id` INTEGER NOT NULL,
    `sensor_data_id` BIGINT NULL,
    `qr_scan_id` BIGINT NULL,
    `scope_type` VARCHAR(50) NOT NULL,
    `quantity` DECIMAL(18, 6) NOT NULL,
    `usage_at` DATETIME(3) NOT NULL,
    `source_type` VARCHAR(50) NOT NULL,
    `evidence_file_path` VARCHAR(500) NULL,
    `remark` VARCHAR(1000) NULL,
    `recorded_by` INTEGER NOT NULL,
    `processing_status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `resource_usage_usage_reference_key`(`usage_reference`),
    INDEX `resource_usage_company_id_usage_at_idx`(`company_id`, `usage_at`),
    INDEX `resource_usage_factory_id_usage_at_idx`(`factory_id`, `usage_at`),
    INDEX `resource_usage_building_id_usage_at_idx`(`building_id`, `usage_at`),
    INDEX `resource_usage_department_id_usage_at_idx`(`department_id`, `usage_at`),
    INDEX `resource_usage_line_id_usage_at_idx`(`line_id`, `usage_at`),
    INDEX `resource_usage_machine_id_usage_at_idx`(`machine_id`, `usage_at`),
    INDEX `resource_usage_checkpoint_id_usage_at_idx`(`checkpoint_id`, `usage_at`),
    INDEX `resource_usage_resource_type_id_usage_at_idx`(`resource_type_id`, `usage_at`),
    INDEX `resource_usage_unit_id_idx`(`unit_id`),
    INDEX `resource_usage_sensor_data_id_idx`(`sensor_data_id`),
    INDEX `resource_usage_qr_scan_id_idx`(`qr_scan_id`),
    INDEX `resource_usage_recorded_by_usage_at_idx`(`recorded_by`, `usage_at`),
    INDEX `resource_usage_scope_type_idx`(`scope_type`),
    INDEX `resource_usage_source_type_idx`(`source_type`),
    INDEX `resource_usage_processing_status_idx`(`processing_status`),
    INDEX `resource_usage_status_idx`(`status`),
    PRIMARY KEY (`usage_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `machine` (
    `machine_id` INTEGER NOT NULL AUTO_INCREMENT,
    `line_id` INTEGER NOT NULL,
    `machine_type_id` INTEGER NOT NULL,
    `machine_code` VARCHAR(50) NOT NULL,
    `machine_name` VARCHAR(200) NOT NULL,
    `manufacturer` VARCHAR(150) NULL,
    `model` VARCHAR(150) NULL,
    `serial_number` VARCHAR(150) NULL,
    `installation_date` DATE NULL,
    `layout_x` DECIMAL(18, 4) NULL,
    `layout_y` DECIMAL(18, 4) NULL,
    `layout_width` DECIMAL(18, 4) NULL,
    `layout_height` DECIMAL(18, 4) NULL,
    `layout_rotation` DECIMAL(18, 4) NULL,
    `location_note` VARCHAR(500) NULL,
    `operational_status` VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `machine_line_id_idx`(`line_id`),
    INDEX `machine_machine_type_id_idx`(`machine_type_id`),
    INDEX `machine_machine_name_idx`(`machine_name`),
    INDEX `machine_operational_status_idx`(`operational_status`),
    INDEX `machine_status_idx`(`status`),
    UNIQUE INDEX `machine_line_id_machine_code_key`(`line_id`, `machine_code`),
    PRIMARY KEY (`machine_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkpoint` (
    `checkpoint_id` INTEGER NOT NULL AUTO_INCREMENT,
    `line_id` INTEGER NOT NULL,
    `checkpoint_code` VARCHAR(50) NOT NULL,
    `checkpoint_name` VARCHAR(200) NOT NULL,
    `checkpoint_type` VARCHAR(100) NULL,
    `description` VARCHAR(500) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `checkpoint_line_id_idx`(`line_id`),
    INDEX `checkpoint_status_idx`(`status`),
    INDEX `checkpoint_checkpoint_name_idx`(`checkpoint_name`),
    UNIQUE INDEX `checkpoint_line_id_checkpoint_code_key`(`line_id`, `checkpoint_code`),
    PRIMARY KEY (`checkpoint_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qr_code` (
    `qr_id` BIGINT NOT NULL AUTO_INCREMENT,
    `machine_id` INTEGER NULL,
    `checkpoint_id` INTEGER NULL,
    `qr_code` VARCHAR(500) NOT NULL,
    `qr_token` VARCHAR(255) NOT NULL,
    `qr_image_path` VARCHAR(500) NULL,
    `qr_status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `generated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `qr_code_qr_token_key`(`qr_token`),
    INDEX `qr_code_machine_id_idx`(`machine_id`),
    INDEX `qr_code_checkpoint_id_idx`(`checkpoint_id`),
    INDEX `qr_code_qr_status_idx`(`qr_status`),
    PRIMARY KEY (`qr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qr_scan_log` (
    `scan_id` BIGINT NOT NULL AUTO_INCREMENT,
    `qr_id` BIGINT NOT NULL,
    `user_id` INTEGER NOT NULL,
    `scan_result` VARCHAR(50) NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `device` VARCHAR(150) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `scanned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `qr_scan_log_qr_id_scanned_at_idx`(`qr_id`, `scanned_at`),
    INDEX `qr_scan_log_user_id_scanned_at_idx`(`user_id`, `scanned_at`),
    INDEX `qr_scan_log_scan_result_idx`(`scan_result`),
    PRIMARY KEY (`scan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensor` (
    `sensor_id` INTEGER NOT NULL AUTO_INCREMENT,
    `machine_id` INTEGER NOT NULL,
    `sensor_type_id` INTEGER NOT NULL,
    `sensor_code` VARCHAR(50) NOT NULL,
    `sensor_name` VARCHAR(200) NOT NULL,
    `serial_number` VARCHAR(150) NULL,
    `manufacturer` VARCHAR(150) NULL,
    `protocol` VARCHAR(50) NULL,
    `connection_address` VARCHAR(255) NULL,
    `data_topic` VARCHAR(255) NULL,
    `sampling_interval_seconds` INTEGER NULL,
    `last_connected_at` DATETIME(3) NULL,
    `installation_date` DATE NULL,
    `last_calibration_date` DATE NULL,
    `next_calibration_date` DATE NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `sensor_machine_id_idx`(`machine_id`),
    INDEX `sensor_sensor_type_id_idx`(`sensor_type_id`),
    INDEX `sensor_status_idx`(`status`),
    INDEX `sensor_last_connected_at_idx`(`last_connected_at`),
    INDEX `sensor_sensor_name_idx`(`sensor_name`),
    UNIQUE INDEX `sensor_machine_id_sensor_code_key`(`machine_id`, `sensor_code`),
    PRIMARY KEY (`sensor_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensor_data` (
    `sensor_data_id` BIGINT NOT NULL AUTO_INCREMENT,
    `sensor_id` INTEGER NOT NULL,
    `unit_id` INTEGER NOT NULL,
    `raw_value` DECIMAL(18, 6) NOT NULL,
    `processed_value` DECIMAL(18, 6) NULL,
    `quality_status` VARCHAR(30) NOT NULL DEFAULT 'VALID',
    `measured_at` DATETIME(3) NOT NULL,
    `received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sensor_data_sensor_id_measured_at_idx`(`sensor_id`, `measured_at`),
    INDEX `sensor_data_unit_id_idx`(`unit_id`),
    INDEX `sensor_data_quality_status_idx`(`quality_status`),
    INDEX `sensor_data_measured_at_idx`(`measured_at`),
    PRIMARY KEY (`sensor_data_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carbon_result` (
    `carbon_id` BIGINT NOT NULL AUTO_INCREMENT,
    `usage_id` BIGINT NOT NULL,
    `factor_id` INTEGER NOT NULL,
    `quantity_used` DECIMAL(18, 6) NOT NULL,
    `factor_used` DECIMAL(18, 6) NOT NULL,
    `carbon_value` DECIMAL(18, 6) NOT NULL,
    `carbon_unit` VARCHAR(50) NOT NULL,
    `scope` VARCHAR(30) NOT NULL,
    `calculation_status` VARCHAR(30) NOT NULL DEFAULT 'CALCULATED',
    `calculation_version` VARCHAR(50) NOT NULL,
    `calculated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `carbon_result_usage_id_key`(`usage_id`),
    INDEX `carbon_result_usage_id_idx`(`usage_id`),
    INDEX `carbon_result_factor_id_idx`(`factor_id`),
    INDEX `carbon_result_scope_idx`(`scope`),
    INDEX `carbon_result_calculation_status_idx`(`calculation_status`),
    INDEX `carbon_result_calculated_at_idx`(`calculated_at`),
    PRIMARY KEY (`carbon_id`)
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

-- CreateTable
CREATE TABLE `backup_record` (
    `backup_id` INTEGER NOT NULL AUTO_INCREMENT,
    `backup_code` VARCHAR(100) NOT NULL,
    `backup_type` VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    `backup_scope` VARCHAR(30) NOT NULL DEFAULT 'FULL',
    `storage_type` VARCHAR(30) NOT NULL DEFAULT 'LOCAL',
    `file_name` VARCHAR(255) NULL,
    `file_path` VARCHAR(1000) NULL,
    `file_size` BIGINT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'RUNNING',
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `duration_seconds` INTEGER NULL,
    `created_by_user_id` INTEGER NULL,
    `created_by_name` VARCHAR(200) NULL,
    `error_message` TEXT NULL,
    `restored_at` DATETIME(3) NULL,
    `restored_by_user_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `backup_record_backup_code_key`(`backup_code`),
    INDEX `backup_record_status_idx`(`status`),
    INDEX `backup_record_backup_type_idx`(`backup_type`),
    INDEX `backup_record_created_at_idx`(`created_at`),
    INDEX `backup_record_created_by_user_id_idx`(`created_by_user_id`),
    PRIMARY KEY (`backup_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_setting` (
    `system_setting_id` INTEGER NOT NULL AUTO_INCREMENT,
    `maintenance_mode` BOOLEAN NOT NULL DEFAULT false,
    `force_mfa` BOOLEAN NOT NULL DEFAULT false,
    `ip_protection` BOOLEAN NOT NULL DEFAULT true,
    `anomaly_detection` BOOLEAN NOT NULL DEFAULT true,
    `auto_block` BOOLEAN NOT NULL DEFAULT true,
    `session_timeout_minutes` INTEGER NOT NULL DEFAULT 60,
    `max_login_attempts` INTEGER NOT NULL DEFAULT 5,
    `audit_retention_days` INTEGER NOT NULL DEFAULT 365,
    `login_retention_days` INTEGER NOT NULL DEFAULT 180,
    `backup_frequency` VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    `carbon_analytics_enabled` BOOLEAN NOT NULL DEFAULT true,
    `sensor_monitoring_enabled` BOOLEAN NOT NULL DEFAULT true,
    `ai_recommendations_enabled` BOOLEAN NOT NULL DEFAULT false,
    `machine_qr_enabled` BOOLEAN NOT NULL DEFAULT true,
    `report_builder_enabled` BOOLEAN NOT NULL DEFAULT false,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`system_setting_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_tickets` (
    `ticket_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticket_reference` VARCHAR(50) NOT NULL,
    `reporter_id` INTEGER NOT NULL,
    `company_id` INTEGER NULL,
    `subject` VARCHAR(150) NOT NULL,
    `category` VARCHAR(30) NOT NULL,
    `priority` VARCHAR(20) NOT NULL,
    `description` TEXT NOT NULL,
    `page_url` VARCHAR(500) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `support_tickets_ticket_reference_key`(`ticket_reference`),
    INDEX `support_tickets_reporter_id_idx`(`reporter_id`),
    INDEX `support_tickets_company_id_idx`(`company_id`),
    INDEX `support_tickets_status_idx`(`status`),
    INDEX `support_tickets_created_at_idx`(`created_at`),
    PRIMARY KEY (`ticket_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_token` (
    `reset_token_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token_hash` VARCHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_token_token_hash_key`(`token_hash`),
    INDEX `idx_password_reset_user`(`user_id`),
    INDEX `idx_password_reset_expires`(`expires_at`),
    PRIMARY KEY (`reset_token_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manager_chat_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `company_id` INTEGER NOT NULL,
    `transcript` JSON NOT NULL,
    `mode` VARCHAR(20) NOT NULL DEFAULT 'general',
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `manager_chat_history_user_id_company_id_key`(`user_id`, `company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `factory` ADD CONSTRAINT `factory_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `building` ADD CONSTRAINT `building_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory`(`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `department` ADD CONSTRAINT `department_building_id_fkey` FOREIGN KEY (`building_id`) REFERENCES `building`(`building_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_line` ADD CONSTRAINT `production_line_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`role_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permission`(`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`company_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory`(`factory_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `login_log` ADD CONSTRAINT `login_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_alert_id_fkey` FOREIGN KEY (`alert_id`) REFERENCES `alert`(`alert_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_type` ADD CONSTRAINT `resource_type_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `resource_category`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_type` ADD CONSTRAINT `resource_type_default_unit_id_fkey` FOREIGN KEY (`default_unit_id`) REFERENCES `unit`(`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emission_factor` ADD CONSTRAINT `emission_factor_resource_type_id_fkey` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_type`(`resource_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory`(`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_building_id_fkey` FOREIGN KEY (`building_id`) REFERENCES `building`(`building_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `production_line`(`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine`(`machine_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_checkpoint_id_fkey` FOREIGN KEY (`checkpoint_id`) REFERENCES `checkpoint`(`checkpoint_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_resource_type_id_fkey` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_type`(`resource_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `unit`(`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_sensor_data_id_fkey` FOREIGN KEY (`sensor_data_id`) REFERENCES `sensor_data`(`sensor_data_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_qr_scan_id_fkey` FOREIGN KEY (`qr_scan_id`) REFERENCES `qr_scan_log`(`scan_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_recorded_by_fkey` FOREIGN KEY (`recorded_by`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `machine` ADD CONSTRAINT `machine_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `production_line`(`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `machine` ADD CONSTRAINT `machine_machine_type_id_fkey` FOREIGN KEY (`machine_type_id`) REFERENCES `machine_type`(`machine_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkpoint` ADD CONSTRAINT `checkpoint_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `production_line`(`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_code` ADD CONSTRAINT `qr_code_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine`(`machine_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_code` ADD CONSTRAINT `qr_code_checkpoint_id_fkey` FOREIGN KEY (`checkpoint_id`) REFERENCES `checkpoint`(`checkpoint_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_scan_log` ADD CONSTRAINT `qr_scan_log_qr_id_fkey` FOREIGN KEY (`qr_id`) REFERENCES `qr_code`(`qr_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_scan_log` ADD CONSTRAINT `qr_scan_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensor` ADD CONSTRAINT `sensor_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine`(`machine_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensor` ADD CONSTRAINT `sensor_sensor_type_id_fkey` FOREIGN KEY (`sensor_type_id`) REFERENCES `sensor_type`(`sensor_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensor_data` ADD CONSTRAINT `sensor_data_sensor_id_fkey` FOREIGN KEY (`sensor_id`) REFERENCES `sensor`(`sensor_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensor_data` ADD CONSTRAINT `sensor_data_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `unit`(`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carbon_result` ADD CONSTRAINT `carbon_result_usage_id_fkey` FOREIGN KEY (`usage_id`) REFERENCES `resource_usage`(`usage_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carbon_result` ADD CONSTRAINT `carbon_result_factor_id_fkey` FOREIGN KEY (`factor_id`) REFERENCES `emission_factor`(`factor_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
