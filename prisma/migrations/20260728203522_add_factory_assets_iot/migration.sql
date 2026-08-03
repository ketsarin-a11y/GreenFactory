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
