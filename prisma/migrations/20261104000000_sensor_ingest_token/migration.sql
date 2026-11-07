-- AlterTable
ALTER TABLE `sensor` ADD COLUMN `ingest_token_hash` VARCHAR(64) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `sensor_ingest_token_hash_key` ON `sensor`(`ingest_token_hash`);

