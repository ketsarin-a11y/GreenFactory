/*
  Warnings:

  - You are about to alter the column `company_code` on the `company` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `tax_id` on the `company` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.
  - You are about to alter the column `phone` on the `company` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.
  - You are about to alter the column `status` on the `company` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.
  - You are about to alter the column `role_name` on the `role` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `employee_code` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `first_name` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `last_name` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `username` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `phone` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.

*/
-- AlterTable
ALTER TABLE `company` ADD COLUMN `address` VARCHAR(500) NULL,
    ADD COLUMN `carbon_standard` VARCHAR(100) NULL,
    ADD COLUMN `country` VARCHAR(100) NULL,
    ADD COLUMN `currency` VARCHAR(10) NULL,
    ADD COLUMN `industry_type` VARCHAR(100) NULL,
    ADD COLUMN `language` VARCHAR(10) NULL,
    ADD COLUMN `logo_path` VARCHAR(500) NULL,
    ADD COLUMN `postal_code` VARCHAR(20) NULL,
    ADD COLUMN `province` VARCHAR(100) NULL,
    ADD COLUMN `subscription_plan` VARCHAR(50) NULL,
    ADD COLUMN `timezone` VARCHAR(100) NULL,
    ADD COLUMN `website` VARCHAR(255) NULL,
    MODIFY `company_name` VARCHAR(200) NOT NULL,
    MODIFY `company_code` VARCHAR(50) NOT NULL,
    MODIFY `tax_id` VARCHAR(30) NULL,
    MODIFY `email` VARCHAR(255) NULL,
    MODIFY `phone` VARCHAR(30) NULL,
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `role` MODIFY `role_name` VARCHAR(100) NOT NULL,
    MODIFY `description` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `department_id` INTEGER NULL,
    ADD COLUMN `factory_id` INTEGER NULL,
    MODIFY `employee_code` VARCHAR(50) NULL,
    MODIFY `first_name` VARCHAR(100) NOT NULL,
    MODIFY `last_name` VARCHAR(100) NOT NULL,
    MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `username` VARCHAR(100) NOT NULL,
    MODIFY `password_hash` VARCHAR(255) NOT NULL,
    MODIFY `phone` VARCHAR(30) NULL;

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

-- CreateIndex
CREATE INDEX `company_status_idx` ON `company`(`status`);

-- CreateIndex
CREATE INDEX `company_company_name_idx` ON `company`(`company_name`);

-- CreateIndex
CREATE INDEX `user_factory_id_idx` ON `user`(`factory_id`);

-- CreateIndex
CREATE INDEX `user_department_id_idx` ON `user`(`department_id`);

-- CreateIndex
CREATE INDEX `user_status_idx` ON `user`(`status`);

-- CreateIndex
CREATE INDEX `user_company_id_role_id_idx` ON `user`(`company_id`, `role_id`);

-- CreateIndex
CREATE INDEX `user_factory_id_role_id_idx` ON `user`(`factory_id`, `role_id`);

-- CreateIndex
CREATE INDEX `user_department_id_role_id_idx` ON `user`(`department_id`, `role_id`);

-- AddForeignKey
ALTER TABLE `factory` ADD CONSTRAINT `factory_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `building` ADD CONSTRAINT `building_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory`(`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `department` ADD CONSTRAINT `department_building_id_fkey` FOREIGN KEY (`building_id`) REFERENCES `building`(`building_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_line` ADD CONSTRAINT `production_line_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory`(`factory_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`) ON DELETE SET NULL ON UPDATE CASCADE;
