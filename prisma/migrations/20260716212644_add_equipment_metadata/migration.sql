/*
  Warnings:

  - A unique constraint covering the columns `[equipment_code]` on the table `equipment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `equipment` ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `equipment_code` VARCHAR(191) NULL,
    ADD COLUMN `equipment_type` VARCHAR(191) NULL,
    ADD COLUMN `production_line` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE `resource_record` ADD COLUMN `note` TEXT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `equipment_equipment_code_key` ON `equipment`(`equipment_code`);
