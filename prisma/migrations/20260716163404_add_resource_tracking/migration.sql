-- CreateTable
CREATE TABLE `equipment` (
    `equipment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `resource_type` ENUM('ELECTRICITY', 'WATER', 'GAS') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `equipment_company_id_idx`(`company_id`),
    PRIMARY KEY (`equipment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource_record` (
    `record_id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipment_id` INTEGER NOT NULL,
    `recorded_by_id` INTEGER NOT NULL,
    `value` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'RECORDED') NOT NULL DEFAULT 'RECORDED',
    `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `resource_record_recorded_by_id_recorded_at_idx`(`recorded_by_id`, `recorded_at`),
    INDEX `resource_record_equipment_id_recorded_at_idx`(`equipment_id`, `recorded_at`),
    PRIMARY KEY (`record_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `equipment` ADD CONSTRAINT `equipment_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_record` ADD CONSTRAINT `resource_record_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`equipment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_record` ADD CONSTRAINT `resource_record_recorded_by_id_fkey` FOREIGN KEY (`recorded_by_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
