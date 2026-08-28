-- CreateTable
CREATE TABLE `password_reset_token` (
    `reset_token_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_token_token_hash_key`(`token_hash`),
    INDEX `password_reset_token_user_id_idx`(`user_id`),
    INDEX `password_reset_token_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`reset_token_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `password_reset_token` ADD CONSTRAINT `password_reset_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
