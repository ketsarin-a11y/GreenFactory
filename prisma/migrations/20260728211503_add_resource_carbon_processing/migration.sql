/*
  Warnings:

  - You are about to drop the column `qRCodeQrId` on the `resource_usage` table. All the data in the column will be lost.
  - You are about to drop the column `sensorSensorId` on the `resource_usage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `resource_usage` DROP FOREIGN KEY `resource_usage_qRCodeQrId_fkey`;

-- DropForeignKey
ALTER TABLE `resource_usage` DROP FOREIGN KEY `resource_usage_sensorSensorId_fkey`;

-- DropIndex
DROP INDEX `resource_usage_qRCodeQrId_fkey` ON `resource_usage`;

-- DropIndex
DROP INDEX `resource_usage_sensorSensorId_fkey` ON `resource_usage`;

-- AlterTable
ALTER TABLE `resource_usage` DROP COLUMN `qRCodeQrId`,
    DROP COLUMN `sensorSensorId`;
