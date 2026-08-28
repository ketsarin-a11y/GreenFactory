-- CreateTable
CREATE TABLE `company` (
    `company_id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_name` VARCHAR(191) NOT NULL,
    `company_code` VARCHAR(191) NOT NULL,
    `tax_id` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `company_company_code_key`(`company_code`),
    PRIMARY KEY (`company_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `role_role_name_key`(`role_name`),
    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NULL,
    `role_id` INTEGER NOT NULL,
    `employee_code` VARCHAR(191) NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `failed_login` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    `last_login` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_username_key`(`username`),
    INDEX `user_company_id_idx`(`company_id`),
    INDEX `user_role_id_idx`(`role_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`company_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
