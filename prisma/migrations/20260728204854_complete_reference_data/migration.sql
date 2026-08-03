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

-- AddForeignKey
ALTER TABLE `resource_type` ADD CONSTRAINT `resource_type_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `resource_category`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_type` ADD CONSTRAINT `resource_type_default_unit_id_fkey` FOREIGN KEY (`default_unit_id`) REFERENCES `unit`(`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emission_factor` ADD CONSTRAINT `emission_factor_resource_type_id_fkey` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_type`(`resource_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
