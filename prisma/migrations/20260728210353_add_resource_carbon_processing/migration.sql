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
    `qRCodeQrId` BIGINT NULL,
    `sensorSensorId` INTEGER NULL,

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

    INDEX `carbon_result_usage_id_idx`(`usage_id`),
    INDEX `carbon_result_factor_id_idx`(`factor_id`),
    INDEX `carbon_result_scope_idx`(`scope`),
    INDEX `carbon_result_calculation_status_idx`(`calculation_status`),
    INDEX `carbon_result_calculated_at_idx`(`calculated_at`),
    PRIMARY KEY (`carbon_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_qRCodeQrId_fkey` FOREIGN KEY (`qRCodeQrId`) REFERENCES `qr_code`(`qr_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_usage` ADD CONSTRAINT `resource_usage_sensorSensorId_fkey` FOREIGN KEY (`sensorSensorId`) REFERENCES `sensor`(`sensor_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carbon_result` ADD CONSTRAINT `carbon_result_usage_id_fkey` FOREIGN KEY (`usage_id`) REFERENCES `resource_usage`(`usage_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carbon_result` ADD CONSTRAINT `carbon_result_factor_id_fkey` FOREIGN KEY (`factor_id`) REFERENCES `emission_factor`(`factor_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
