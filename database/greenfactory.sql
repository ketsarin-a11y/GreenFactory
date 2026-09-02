-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: greenfactory
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('0ced6961-ede6-4c66-9311-85d0cc8bfdf6','16d78593e52ea84af8d709df1eeebc629ef389503742e9c940c39e75b9028482','2026-07-28 21:17:25.620','20260728211503_add_resource_carbon_processing',NULL,NULL,'2026-07-28 21:17:25.525',1),('0e1943e0-323b-4761-8791-795035b28d38','065226f4764acd932de45319bc9ed847268124bc15297d809ec114ac6f65f76e','2026-07-28 20:50:30.219','20260728204854_complete_reference_data',NULL,NULL,'2026-07-28 20:50:29.989',1),('123bac51-ab4d-49f5-a2a9-e04a40ae786e','32369d24c8fce36ffd38033088c10044e65a5075616eb649601a26d2d5a6dc7b','2026-07-24 07:51:15.904','20260718213228_add_record_attachment',NULL,NULL,'2026-07-24 07:51:15.894',1),('5bc427b6-b1bd-4d56-b989-74ee82e70738','9e0cfa8d72f4b779329257702d9104c5de28c6951ded1062b37dfb9ae5495525','2026-07-24 07:51:15.893','20260718210413_expand_resource_types',NULL,NULL,'2026-07-24 07:51:15.843',1),('62ec3f0c-72df-44df-8649-a8cdf0ffbf0b','ae6d641a7d9815d5850b1a036f26cd3f58d178fcdf40257758b5457037b7cc30','2026-07-24 07:51:15.842','20260718203357_add_user_department_line',NULL,NULL,'2026-07-24 07:51:15.823',1),('632b4b8f-2f9a-4a00-8e40-c36d002311a8','8eb019c9b0f392aead0e9b9c982e10f37669dbe4e6a3e0f3d4f06b7f92ca836c','2026-07-29 10:41:41.578','20260729104141_add_password_reset_token',NULL,NULL,'2026-07-29 10:41:41.480',1),('7ed99b3e-18a8-4fe4-b775-ed483206d735','0f542c2dc2b439ee2800ab7ae69be7bee8806eab8b3992db6f0c52e5d97eb749','2026-07-24 07:51:15.823','20260716212644_add_equipment_metadata',NULL,NULL,'2026-07-24 07:51:15.785',1),('88e25fac-afc3-44fa-82bc-fc15182cc5e7','384f12ac20840832d79d7836cbd9e1698b3e892b562183c888cf0049c148ef8b','2026-07-28 20:36:52.904','20260728203522_add_factory_assets_iot',NULL,NULL,'2026-07-28 20:36:52.141',1),('a4b95d88-30af-4a63-97c3-27d15b5d1862','fd7409bea1cf5bf72a922b81bf769f21f839a6dd4debffb1f5ee2c976cf187f1','2026-07-28 21:15:00.815','20260728210353_add_resource_carbon_processing',NULL,NULL,'2026-07-28 21:14:59.826',1),('baf2a52c-11e6-483c-870b-7d9dd439f499','975141a6880a8ca506a62a538f9507e22acc53eecff7a149398f6ca4272fb1e8','2026-07-14 19:43:09.870','20260714194309_init_platform_auth',NULL,NULL,'2026-07-14 19:43:09.715',1),('c97bdc8a-0373-4bd7-aaa4-0aca2b05a3ee','f6e3e928086411f7e4ef455fdeb6b0ee76df4dab88107f37ff1b218972644a1d','2026-07-28 19:16:16.482','20260728191315_add_organization_structure',NULL,NULL,'2026-07-28 19:16:15.564',1),('cbc01c6e-982f-4025-9e21-944aeeff1b09','4803ad72021046dc2af9fd28c761283bf95d19d63cffb84683fc7a74ff5284f0','2026-07-24 07:51:15.784','20260716163404_add_resource_tracking',NULL,NULL,'2026-07-24 07:51:15.586',1),('db059146-a368-4fae-bf66-d9900a813081','eaa342e8a4714fd7b815abf146270976799f611dd23d16b5b3174924f8c37895','2026-08-02 01:32:41.393','20260802013238_add_role_permissions_step1',NULL,NULL,'2026-08-02 01:32:38.898',1),('f94cdb70-9f01-4ca9-86e9-af1ebeff2655','3919e6e6527f7dea1fafcf578d211e7c015b571930fe2ff6de074dfb4a94b059','2026-08-16 19:54:09.568','20260816195409_add_backup_record',NULL,NULL,'2026-08-16 19:54:09.536',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_recommendation`
--

DROP TABLE IF EXISTS `ai_recommendation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_recommendation` (
  `recommendation_id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `factory_id` int DEFAULT NULL,
  `building_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `line_id` int DEFAULT NULL,
  `machine_id` int DEFAULT NULL,
  `usage_id` bigint DEFAULT NULL,
  `kpi_result_id` bigint DEFAULT NULL,
  `alert_id` bigint DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  `recommendation_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estimated_cost_saving` decimal(18,4) DEFAULT NULL,
  `estimated_energy_saving` decimal(18,4) DEFAULT NULL,
  `estimated_carbon_saving` decimal(18,4) DEFAULT NULL,
  `priority` int NOT NULL DEFAULT '3',
  `confidence_score` decimal(5,4) DEFAULT NULL,
  `review_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `implementation_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NOT_STARTED',
  `reviewed_at` datetime(3) DEFAULT NULL,
  `implemented_at` datetime(3) DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`recommendation_id`),
  KEY `ai_recommendation_company_id_created_at_idx` (`company_id`,`created_at`),
  KEY `ai_recommendation_factory_id_created_at_idx` (`factory_id`,`created_at`),
  KEY `ai_recommendation_building_id_idx` (`building_id`),
  KEY `ai_recommendation_department_id_idx` (`department_id`),
  KEY `ai_recommendation_line_id_idx` (`line_id`),
  KEY `ai_recommendation_machine_id_idx` (`machine_id`),
  KEY `ai_recommendation_usage_id_idx` (`usage_id`),
  KEY `ai_recommendation_kpi_result_id_idx` (`kpi_result_id`),
  KEY `ai_recommendation_alert_id_idx` (`alert_id`),
  KEY `ai_recommendation_reviewed_by_idx` (`reviewed_by`),
  KEY `ai_recommendation_priority_idx` (`priority`),
  KEY `ai_recommendation_review_status_idx` (`review_status`),
  KEY `ai_recommendation_implementation_status_idx` (`implementation_status`),
  KEY `ai_recommendation_status_idx` (`status`),
  CONSTRAINT `ai_recommendation_alert_id_fkey` FOREIGN KEY (`alert_id`) REFERENCES `alert` (`alert_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ai_recommendation_building_id_fkey` FOREIGN KEY (`building_id`) REFERENCES `building` (`building_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ai_recommendation_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ai_recommendation_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ai_recommendation_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory` (`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ai_recommendation_kpi_result_id_fkey` FOREIGN KEY (`kpi_result_id`) REFERENCES `kpi_result` (`result_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ai_recommendation_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `production_line` (`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ai_recommendation_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine` (`machine_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ai_recommendation_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ai_recommendation_usage_id_fkey` FOREIGN KEY (`usage_id`) REFERENCES `resource_usage` (`usage_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_recommendation`
--

LOCK TABLES `ai_recommendation` WRITE;
/*!40000 ALTER TABLE `ai_recommendation` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_recommendation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alert`
--

DROP TABLE IF EXISTS `alert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alert` (
  `alert_id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `factory_id` int DEFAULT NULL,
  `building_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `line_id` int DEFAULT NULL,
  `machine_id` int DEFAULT NULL,
  `usage_id` bigint DEFAULT NULL,
  `kpi_result_id` bigint DEFAULT NULL,
  `resolved_by` int DEFAULT NULL,
  `alert_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `alert_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `threshold_value` decimal(18,6) DEFAULT NULL,
  `actual_value` decimal(18,6) DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `triggered_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `acknowledged_at` datetime(3) DEFAULT NULL,
  `resolved_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`alert_id`),
  UNIQUE KEY `alert_alert_code_key` (`alert_code`),
  KEY `alert_company_id_triggered_at_idx` (`company_id`,`triggered_at`),
  KEY `alert_factory_id_triggered_at_idx` (`factory_id`,`triggered_at`),
  KEY `alert_building_id_idx` (`building_id`),
  KEY `alert_department_id_idx` (`department_id`),
  KEY `alert_line_id_idx` (`line_id`),
  KEY `alert_machine_id_idx` (`machine_id`),
  KEY `alert_usage_id_idx` (`usage_id`),
  KEY `alert_kpi_result_id_idx` (`kpi_result_id`),
  KEY `alert_resolved_by_idx` (`resolved_by`),
  KEY `alert_severity_idx` (`severity`),
  KEY `alert_status_idx` (`status`),
  CONSTRAINT `alert_building_id_fkey` FOREIGN KEY (`building_id`) REFERENCES `building` (`building_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `alert_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `alert_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `alert_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory` (`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `alert_kpi_result_id_fkey` FOREIGN KEY (`kpi_result_id`) REFERENCES `kpi_result` (`result_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `alert_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `production_line` (`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `alert_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine` (`machine_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `alert_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `alert_usage_id_fkey` FOREIGN KEY (`usage_id`) REFERENCES `resource_usage` (`usage_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alert`
--

LOCK TABLES `alert` WRITE;
/*!40000 ALTER TABLE `alert` DISABLE KEYS */;
/*!40000 ALTER TABLE `alert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `audit_log_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `table_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` bigint NOT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`audit_log_id`),
  KEY `audit_log_user_id_created_at_idx` (`user_id`,`created_at`),
  KEY `audit_log_table_name_record_id_idx` (`table_name`,`record_id`),
  KEY `audit_log_action_idx` (`action`),
  KEY `audit_log_created_at_idx` (`created_at`),
  CONSTRAINT `audit_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
INSERT INTO `audit_log` VALUES (1,1,'backup_record',1,'CREATE',NULL,'{\"status\": \"COMPLETED\", \"fileName\": \"BKP20260817-031135.sql\", \"fileSize\": \"126635\", \"backupCode\": \"BKP20260817-031135\", \"backupScope\": \"FULL\", \"storageType\": \"LOCAL\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','2026-08-16 20:11:36.299');
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_record`
--

DROP TABLE IF EXISTS `backup_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_record` (
  `backup_id` int NOT NULL AUTO_INCREMENT,
  `backup_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `backup_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MANUAL',
  `backup_scope` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FULL',
  `storage_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LOCAL',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RUNNING',
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completed_at` datetime(3) DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `created_by_user_id` int DEFAULT NULL,
  `created_by_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `restored_at` datetime(3) DEFAULT NULL,
  `restored_by_user_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`backup_id`),
  UNIQUE KEY `backup_record_backup_code_key` (`backup_code`),
  KEY `backup_record_status_idx` (`status`),
  KEY `backup_record_backup_type_idx` (`backup_type`),
  KEY `backup_record_created_at_idx` (`created_at`),
  KEY `backup_record_created_by_user_id_idx` (`created_by_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_record`
--

LOCK TABLES `backup_record` WRITE;
/*!40000 ALTER TABLE `backup_record` DISABLE KEYS */;
INSERT INTO `backup_record` VALUES (1,'BKP20260817-031135','MANUAL','FULL','LOCAL','BKP20260817-031135.sql','C:\\Users\\User\\greenfactory\\storage\\backups\\BKP20260817-031135.sql',126635,'COMPLETED',1,'2026-08-16 20:11:35.827','2026-08-16 20:11:36.281',1,1,'Platform Admin',NULL,NULL,NULL,'2026-08-16 20:11:35.841','2026-08-16 20:11:36.290');
/*!40000 ALTER TABLE `backup_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `building`
--

DROP TABLE IF EXISTS `building`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `building` (
  `building_id` int NOT NULL AUTO_INCREMENT,
  `factory_id` int NOT NULL,
  `building_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `building_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `building_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `floor_count` int DEFAULT NULL,
  `layout_x` decimal(18,4) DEFAULT NULL,
  `layout_y` decimal(18,4) DEFAULT NULL,
  `layout_width` decimal(18,4) DEFAULT NULL,
  `layout_height` decimal(18,4) DEFAULT NULL,
  `layout_rotation` decimal(18,4) DEFAULT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`building_id`),
  UNIQUE KEY `building_factory_id_building_code_key` (`factory_id`,`building_code`),
  KEY `building_factory_id_idx` (`factory_id`),
  KEY `building_status_idx` (`status`),
  KEY `building_building_name_idx` (`building_name`),
  CONSTRAINT `building_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory` (`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `building`
--

LOCK TABLES `building` WRITE;
/*!40000 ALTER TABLE `building` DISABLE KEYS */;
INSERT INTO `building` VALUES (1,3,'BLD-A','อาคารผลิต A','Production',2,NULL,NULL,NULL,NULL,NULL,'อาคารหลักสำหรับกระบวนการผลิต','ACTIVE','2026-08-18 19:08:35.609','2026-08-18 19:08:35.609'),(2,3,'BLD-B','อาคารผลิต B','อาคารผลิต',1,NULL,NULL,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-27 20:40:47.390','2026-08-27 20:40:47.390'),(3,3,'BLD-C','อาคารผลิต C','อาคารผลิต',2,NULL,NULL,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-27 20:48:32.134','2026-08-27 20:48:32.134'),(4,3,'BLD-QA','อาคารทดสอบคุณภาพ','อาคารทดสอบและควบคุมคุณภาพ',1,NULL,NULL,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-27 20:50:32.484','2026-08-27 20:50:32.484'),(5,3,'BLD-PKG','อาคารบรรจุภัณฑ์','อาคารบรรจุและจัดเตรียมสินค้า',2,NULL,NULL,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-27 20:52:11.829','2026-08-27 20:52:11.829'),(6,3,'BLD-WH','อาคารคลังสินค้า','อาคารคลังสินค้า',1,NULL,NULL,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-27 20:53:38.802','2026-08-27 20:53:38.802'),(7,4,'BLD-A','อาคารผลิตหลัก','อาคารผลิต',2,NULL,NULL,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 15:32:46.053','2026-08-28 15:32:46.053'),(8,4,'BLD-QA','อาคารตรวจสอบและทดสอบ','อาคารทดสอบและควบคุมคุณภาพ',0,NULL,NULL,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 15:33:53.199','2026-08-28 15:33:53.199'),(9,4,'BLD-WH','อาคารคลังสินค้าและจัดส่ง','อาคารคลังสินค้า',1,NULL,NULL,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 15:34:24.004','2026-08-28 15:34:24.004');
/*!40000 ALTER TABLE `building` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carbon_result`
--

DROP TABLE IF EXISTS `carbon_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carbon_result` (
  `carbon_id` bigint NOT NULL AUTO_INCREMENT,
  `usage_id` bigint NOT NULL,
  `factor_id` int NOT NULL,
  `quantity_used` decimal(18,6) NOT NULL,
  `factor_used` decimal(18,6) NOT NULL,
  `carbon_value` decimal(18,6) NOT NULL,
  `carbon_unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `scope` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `calculation_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CALCULATED',
  `calculation_version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `calculated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`carbon_id`),
  KEY `carbon_result_usage_id_idx` (`usage_id`),
  KEY `carbon_result_factor_id_idx` (`factor_id`),
  KEY `carbon_result_scope_idx` (`scope`),
  KEY `carbon_result_calculation_status_idx` (`calculation_status`),
  KEY `carbon_result_calculated_at_idx` (`calculated_at`),
  CONSTRAINT `carbon_result_factor_id_fkey` FOREIGN KEY (`factor_id`) REFERENCES `emission_factor` (`factor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `carbon_result_usage_id_fkey` FOREIGN KEY (`usage_id`) REFERENCES `resource_usage` (`usage_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carbon_result`
--

LOCK TABLES `carbon_result` WRITE;
/*!40000 ALTER TABLE `carbon_result` DISABLE KEYS */;
/*!40000 ALTER TABLE `carbon_result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checkpoint`
--

DROP TABLE IF EXISTS `checkpoint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checkpoint` (
  `checkpoint_id` int NOT NULL AUTO_INCREMENT,
  `line_id` int NOT NULL,
  `checkpoint_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checkpoint_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checkpoint_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`checkpoint_id`),
  UNIQUE KEY `checkpoint_line_id_checkpoint_code_key` (`line_id`,`checkpoint_code`),
  KEY `checkpoint_line_id_idx` (`line_id`),
  KEY `checkpoint_status_idx` (`status`),
  KEY `checkpoint_checkpoint_name_idx` (`checkpoint_name`),
  CONSTRAINT `checkpoint_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `production_line` (`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkpoint`
--

LOCK TABLES `checkpoint` WRITE;
/*!40000 ALTER TABLE `checkpoint` DISABLE KEYS */;
/*!40000 ALTER TABLE `checkpoint` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company` (
  `company_id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `carbon_standard` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `industry_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subscription_plan` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`company_id`),
  UNIQUE KEY `company_company_code_key` (`company_code`),
  KEY `company_status_idx` (`status`),
  KEY `company_company_name_idx` (`company_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
INSERT INTO `company` VALUES (1,'GreenFactory Electronics','GF001',NULL,'contact@gf.com',NULL,'ACTIVE','2026-07-15 14:19:10.230','2026-09-02 15:36:15.171',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'Nextron Precision Electronics Co., Ltd.','NEXTRON',NULL,'admin@nextron-demo.com','044-001-101','ACTIVE','2026-08-01 20:58:28.112','2026-08-01 20:58:28.112',NULL,'TGO','Thailand','THB','การผลิตอุปกรณ์อิเล็กทรอนิกส์','th',NULL,NULL,'นครราชสีมา','ENTERPRISE','Asia/Bangkok',NULL),(3,'Voltera Electronics Manufacturing Co., Ltd.','VOLTERA',NULL,'admin@voltera-demo.com','038-002-202','ACTIVE','2026-08-01 20:58:37.704','2026-08-01 20:58:37.704',NULL,'TGO','Thailand','THB','การผลิตอุปกรณ์อิเล็กทรอนิกส์','th',NULL,NULL,'ชลบุรี','ENTERPRISE','Asia/Bangkok',NULL);
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `building_id` int NOT NULL,
  `department_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `department_building_id_department_code_key` (`building_id`,`department_code`),
  KEY `department_building_id_idx` (`building_id`),
  KEY `department_status_idx` (`status`),
  KEY `department_department_name_idx` (`department_name`),
  CONSTRAINT `department_building_id_fkey` FOREIGN KEY (`building_id`) REFERENCES `building` (`building_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,1,'SMT','แผนก SMT','แผนกผลิตและประกอบชิ้นส่วนอิเล็กทรอนิกส์','ACTIVE','2026-08-18 19:12:41.499','2026-08-18 19:12:41.499'),(2,1,'DEP-ASM','แผนกประกอบชิ้นส่วน',NULL,'ACTIVE','2026-08-27 20:43:55.600','2026-08-27 20:43:55.600'),(3,1,'DEP-MAT','แผนกเตรียมวัตถุดิบ',NULL,'ACTIVE','2026-08-27 20:44:43.215','2026-08-27 20:44:43.215'),(4,2,'DEP-PCB','แผนกผลิตแผงวงจร',NULL,'ACTIVE','2026-08-27 20:45:03.725','2026-08-27 20:45:03.725'),(5,2,'DEP-SMT','แผนกติดตั้งชิ้นส่วน',NULL,'ACTIVE','2026-08-27 20:45:25.398','2026-08-27 20:45:25.398'),(6,3,'DEP-PROD','แผนกประกอบผลิตภัณฑ์',NULL,'ACTIVE','2026-08-27 20:49:30.936','2026-08-27 20:49:30.936'),(7,3,'DEP-IPQC','แผนกตรวจสอบระหว่างผลิต',NULL,'ACTIVE','2026-08-27 20:49:54.422','2026-08-27 20:49:54.422'),(8,4,'DEP-QA','แผนกควบคุมคุณภาพ',NULL,'ACTIVE','2026-08-27 20:50:59.851','2026-08-27 20:50:59.851'),(9,4,'DEP-TEST','แผนกทดสอบผลิตภัณฑ์',NULL,'ACTIVE','2026-08-27 20:51:22.995','2026-08-27 20:51:22.995'),(10,5,'DEP-PKG','แผนกบรรจุภัณฑ์',NULL,'ACTIVE','2026-08-27 20:52:38.929','2026-08-27 20:52:38.929'),(11,5,'DEP-SHIP','แผนกเตรียมจัดส่ง',NULL,'ACTIVE','2026-08-27 20:53:04.479','2026-08-27 20:53:04.479'),(12,6,'DEP-RM','แผนกคลังวัตถุดิบ',NULL,'ACTIVE','2026-08-27 20:54:02.937','2026-08-27 20:54:02.937'),(13,2,'DEP-FG','แผนกคลังสินค้าสำเร็จรูป',NULL,'ACTIVE','2026-08-27 20:54:22.008','2026-08-27 20:54:22.008'),(14,6,'DEP-FG','แผนกคลังสินค้าสำเร็จรูป',NULL,'ACTIVE','2026-08-27 21:10:42.744','2026-08-27 21:10:42.744'),(15,9,'DEP-RM','แผนกคลังวัตถุดิบ',NULL,'ACTIVE','2026-08-28 15:35:08.534','2026-08-28 15:35:08.534'),(16,9,'DEP-FG','แผนกสินค้าสำเร็จรูปและจัดส่ง',NULL,'ACTIVE','2026-08-28 15:39:40.436','2026-08-28 15:39:40.436'),(17,8,'DEP-QC','แผนกควบคุมคุณภาพ',NULL,'ACTIVE','2026-08-28 15:43:12.474','2026-08-28 15:43:12.474'),(18,8,'DEP-TEST','แผนกทดสอบผลิตภัณฑ์',NULL,'ACTIVE','2026-08-28 15:44:07.739','2026-08-28 15:44:07.739'),(19,7,'DEP-SMT','แผนกติดตั้งชิ้นส่วน SMT',NULL,'ACTIVE','2026-08-28 15:48:13.280','2026-08-28 15:48:13.280'),(20,7,'DEP-ASM','ผนกประกอบผลิตภัณฑ์',NULL,'ACTIVE','2026-08-28 15:48:39.712','2026-08-28 15:48:39.712');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emission_factor`
--

DROP TABLE IF EXISTS `emission_factor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emission_factor` (
  `factor_id` int NOT NULL AUTO_INCREMENT,
  `resource_type_id` int NOT NULL,
  `scope` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `factor` decimal(18,6) NOT NULL,
  `factor_unit` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `effective_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`factor_id`),
  KEY `emission_factor_resource_type_id_idx` (`resource_type_id`),
  KEY `emission_factor_status_idx` (`status`),
  KEY `emission_factor_effective_date_idx` (`effective_date`),
  KEY `emission_factor_expiry_date_idx` (`expiry_date`),
  CONSTRAINT `emission_factor_resource_type_id_fkey` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_type` (`resource_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emission_factor`
--

LOCK TABLES `emission_factor` WRITE;
/*!40000 ALTER TABLE `emission_factor` DISABLE KEYS */;
/*!40000 ALTER TABLE `emission_factor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment`
--

DROP TABLE IF EXISTS `equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment` (
  `equipment_id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_type` enum('ELECTRICITY','WATER','DI_WATER','CHILLED_WATER','COMPRESSED_AIR','NITROGEN','GAS','STEAM','DIESEL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `department` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `equipment_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `equipment_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `production_line` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  PRIMARY KEY (`equipment_id`),
  UNIQUE KEY `equipment_equipment_code_key` (`equipment_code`),
  KEY `equipment_company_id_idx` (`company_id`),
  CONSTRAINT `equipment_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment`
--

LOCK TABLES `equipment` WRITE;
/*!40000 ALTER TABLE `equipment` DISABLE KEYS */;
INSERT INTO `equipment` VALUES (1,1,'Reflow Oven-01','อาคารผลิต ชั้น 1','NITROGEN',1,'2026-07-24 07:51:37.668','2026-09-02 15:36:19.716','Production','SMT1-RO-01','Reflow Oven','SMT Line 1','NORMAL'),(2,1,'Pick and Place-01','อาคารผลิต ชั้น 1','ELECTRICITY',1,'2026-07-24 07:51:37.680','2026-09-02 15:36:19.757','Production','SMT1-PP-01','Pick and Place','SMT Line 1','NORMAL'),(3,1,'AOI-01','อาคารผลิต ชั้น 1','ELECTRICITY',1,'2026-07-24 07:51:37.688','2026-09-02 15:36:19.775','Quality Control','SMT1-AOI-01','AOI Inspection','SMT Line 1','NORMAL'),(4,1,'Reflow Oven-02','อาคารผลิต ชั้น 1','NITROGEN',1,'2026-07-24 07:51:37.697','2026-09-02 15:36:19.793','Production','SMT2-RO-01','Reflow Oven','SMT Line 2','MAINTENANCE'),(5,1,'Wave Soldering-01','อาคารผลิต ชั้น 1','GAS',1,'2026-07-24 07:51:37.704','2026-09-02 15:36:19.813','Production','SMT2-WS-01','Wave Soldering Machine','SMT Line 2','NORMAL'),(6,1,'Wave Soldering-02','อาคารผลิต ชั้น 1','GAS',1,'2026-07-24 07:51:37.711','2026-09-02 15:36:19.831','Production','THT1-WS-01','Wave Soldering Machine','THT Line 1','NORMAL'),(7,1,'Conveyor-01','อาคารผลิต ชั้น 1','ELECTRICITY',1,'2026-07-24 07:51:37.717','2026-09-02 15:36:19.848','Production','THT1-CV-01','Conveyor','THT Line 1','NORMAL'),(8,1,'Plasma Cleaner-01','อาคารผลิต ชั้น 2','ELECTRICITY',1,'2026-07-24 07:51:37.724','2026-09-02 15:36:19.864','Production','CLN1-PC-01','Plasma Cleaner','Cleaning Line 1','NORMAL'),(9,1,'PCB Washer-01','อาคารผลิต ชั้น 2','DI_WATER',1,'2026-07-24 07:51:37.731','2026-09-02 15:36:19.886','Production','CLN1-PW-01','PCB Cleaning Machine','Cleaning Line 1','NORMAL'),(10,1,'X-Ray Inspection-01','อาคารผลิต ชั้น 2','ELECTRICITY',1,'2026-07-24 07:51:37.742','2026-09-02 15:36:19.904','Quality Control','TST1-XR-01','X-Ray Inspection','Testing Line 1','NORMAL'),(11,1,'Packing Conveyor-01','อาคารผลิต ชั้น 2','ELECTRICITY',1,'2026-07-24 07:51:37.748','2026-09-02 15:36:19.920','Production','PKG1-CV-01','Conveyor','Packing Line 1','MAINTENANCE'),(12,1,'Clean Room HVAC-01','อาคาร Clean Room','ELECTRICITY',1,'2026-07-24 07:51:37.754','2026-09-02 15:36:19.936','Facility','CR1-HVAC-01','Clean Room HVAC','Clean Room 1','NORMAL'),(13,1,'DI Water Plant-01','อาคารระบบสาธารณูปโภค','DI_WATER',1,'2026-07-24 07:51:37.760','2026-09-02 15:36:19.959','Utility','UTL-DIW-01','DI Water System',NULL,'NORMAL'),(14,1,'Chiller-01','อาคารระบบสาธารณูปโภค','CHILLED_WATER',1,'2026-07-24 07:51:37.767','2026-09-02 15:36:19.976','Utility','UTL-CH-01','Chiller',NULL,'NORMAL'),(15,1,'Air Compressor-01','อาคารระบบสาธารณูปโภค','COMPRESSED_AIR',1,'2026-07-24 07:51:37.774','2026-09-02 15:36:19.994','Utility','UTL-AC-01','Air Compressor',NULL,'NORMAL'),(16,1,'Nitrogen Generator-01','อาคารระบบสาธารณูปโภค','NITROGEN',1,'2026-07-24 07:51:37.781','2026-09-02 15:36:20.014','Utility','UTL-N2-01','Nitrogen Generator',NULL,'NORMAL'),(17,1,'Diesel Generator-01','อาคารระบบสาธารณูปโภค','DIESEL',1,'2026-07-24 07:51:37.787','2026-09-02 15:36:20.039','Utility','UTL-GEN-01','Diesel Generator',NULL,'OFFLINE'),(18,1,'Boiler-01','อาคารระบบสาธารณูปโภค','STEAM',1,'2026-07-24 07:51:37.794','2026-09-02 15:36:20.057','Utility','UTL-BLR-01','Boiler',NULL,'NORMAL'),(19,1,'Main Water Meter','อาคารคลังสินค้า','WATER',1,'2026-07-24 07:51:37.803','2026-09-02 15:36:20.075','Warehouse','UTL-WM-01','Water Meter',NULL,'NORMAL');
/*!40000 ALTER TABLE `equipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factory`
--

DROP TABLE IF EXISTS `factory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factory` (
  `factory_id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `factory_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `factory_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `google_map_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `map_zoom` int DEFAULT NULL,
  `layout_image_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`factory_id`),
  UNIQUE KEY `factory_company_id_factory_code_key` (`company_id`,`factory_code`),
  KEY `factory_company_id_idx` (`company_id`),
  KEY `factory_status_idx` (`status`),
  KEY `factory_factory_name_idx` (`factory_name`),
  CONSTRAINT `factory_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factory`
--

LOCK TABLES `factory` WRITE;
/*!40000 ALTER TABLE `factory` DISABLE KEYS */;
INSERT INTO `factory` VALUES (1,2,'NEX-KORAT','Nextron Korat Plant','จังหวัดนครราชสีมา','นครราชสีมา',NULL,'Thailand',NULL,NULL,NULL,17,NULL,NULL,NULL,'Asia/Bangkok','ACTIVE','2026-08-01 21:18:33.367','2026-08-01 21:18:33.367'),(2,3,'VOLT-CHONBURI','Voltera Chonburi Plant','จังหวัดชลบุรี','ชลบุรี',NULL,'Thailand',NULL,NULL,NULL,17,NULL,NULL,NULL,'Asia/Bangkok','ACTIVE','2026-08-01 21:18:33.375','2026-08-01 21:18:33.375'),(3,1,'GF-001','GreenFactory Korat','นครราชสีมา','นครราชสีมา','30000','Thailand',NULL,NULL,NULL,16,NULL,NULL,NULL,'Asia/Bangkok','ACTIVE','2026-08-18 14:23:25.432','2026-08-18 14:23:25.432'),(4,1,'1111','ชลบุรี','111','ชลบุรี','40000','Thailand',NULL,NULL,NULL,16,NULL,NULL,NULL,'Asia/Bangkok','ACTIVE','2026-08-21 02:51:19.205','2026-08-21 02:51:19.205');
/*!40000 ALTER TABLE `factory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kpi`
--

DROP TABLE IF EXISTS `kpi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kpi` (
  `kpi_id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `factory_id` int DEFAULT NULL,
  `building_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `line_id` int DEFAULT NULL,
  `machine_id` int DEFAULT NULL,
  `resource_type_id` int DEFAULT NULL,
  `unit_id` int NOT NULL,
  `kpi_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `kpi_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `kpi_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `scope_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_value` decimal(18,6) NOT NULL,
  `target_operator` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`kpi_id`),
  UNIQUE KEY `kpi_company_id_kpi_code_key` (`company_id`,`kpi_code`),
  KEY `kpi_factory_id_idx` (`factory_id`),
  KEY `kpi_building_id_idx` (`building_id`),
  KEY `kpi_department_id_idx` (`department_id`),
  KEY `kpi_line_id_idx` (`line_id`),
  KEY `kpi_machine_id_idx` (`machine_id`),
  KEY `kpi_resource_type_id_idx` (`resource_type_id`),
  KEY `kpi_unit_id_idx` (`unit_id`),
  KEY `kpi_scope_type_idx` (`scope_type`),
  KEY `kpi_period_type_idx` (`period_type`),
  KEY `kpi_status_idx` (`status`),
  CONSTRAINT `kpi_building_id_fkey` FOREIGN KEY (`building_id`) REFERENCES `building` (`building_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `kpi_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `kpi_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `kpi_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory` (`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `kpi_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `production_line` (`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `kpi_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine` (`machine_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `kpi_resource_type_id_fkey` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_type` (`resource_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `kpi_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kpi`
--

LOCK TABLES `kpi` WRITE;
/*!40000 ALTER TABLE `kpi` DISABLE KEYS */;
/*!40000 ALTER TABLE `kpi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kpi_result`
--

DROP TABLE IF EXISTS `kpi_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kpi_result` (
  `result_id` bigint NOT NULL AUTO_INCREMENT,
  `kpi_id` int NOT NULL,
  `actual_value` decimal(18,6) NOT NULL,
  `variance_value` decimal(18,6) NOT NULL,
  `achievement_percent` decimal(18,4) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `result_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `calculated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`result_id`),
  UNIQUE KEY `kpi_result_kpi_id_period_start_period_end_key` (`kpi_id`,`period_start`,`period_end`),
  KEY `kpi_result_kpi_id_calculated_at_idx` (`kpi_id`,`calculated_at`),
  KEY `kpi_result_result_status_idx` (`result_status`),
  KEY `kpi_result_period_start_period_end_idx` (`period_start`,`period_end`),
  CONSTRAINT `kpi_result_kpi_id_fkey` FOREIGN KEY (`kpi_id`) REFERENCES `kpi` (`kpi_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kpi_result`
--

LOCK TABLES `kpi_result` WRITE;
/*!40000 ALTER TABLE `kpi_result` DISABLE KEYS */;
/*!40000 ALTER TABLE `kpi_result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_log`
--

DROP TABLE IF EXISTS `login_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_log` (
  `login_log_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `attempted_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `logout_at` datetime(3) DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failure_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`login_log_id`),
  KEY `login_log_user_id_login_at_idx` (`user_id`,`login_at`),
  KEY `login_log_attempted_email_login_at_idx` (`attempted_email`,`login_at`),
  KEY `login_log_login_status_idx` (`login_status`),
  CONSTRAINT `login_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_log`
--

LOCK TABLES `login_log` WRITE;
/*!40000 ALTER TABLE `login_log` DISABLE KEYS */;
INSERT INTO `login_log` VALUES (1,1,'admin@greenfactory.local','2026-08-16 19:41:51.635',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(2,2,'admin@gf.com','2026-08-16 19:47:35.403',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(3,1,'admin@greenfactory.local','2026-08-16 19:48:15.284','2026-08-17 05:53:39.777','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(4,2,'admin@gf.com','2026-08-17 05:54:27.703',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(5,2,'admin@gf.com','2026-08-18 14:21:36.281',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(6,2,'admin@gf.com','2026-08-20 02:57:50.880',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(7,2,'admin@gf.com','2026-08-20 14:51:35.830','2026-08-20 17:52:24.217','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(8,3,'operator@gf.com','2026-08-20 17:53:10.636',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','FAILED','NO_FACTORY_ASSIGNMENT'),(9,3,'operator@gf.com','2026-08-20 18:36:40.574',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','FAILED','INVALID_PASSWORD'),(10,3,'operator@gf.com','2026-08-20 18:36:42.054',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','FAILED','INVALID_PASSWORD'),(11,3,'operator@gf.com','2026-08-20 18:37:21.794',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(12,3,'operator@gf.com','2026-08-21 01:50:54.699','2026-08-21 02:16:34.598','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(13,2,'admin@gf.com','2026-08-21 02:17:55.837','2026-08-21 02:54:38.208','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(14,3,'operator@gf.com','2026-08-21 02:55:38.489','2026-08-21 02:59:20.337','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(15,4,'manager@gf.com','2026-08-21 03:00:06.412','2026-08-21 05:59:36.011','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(16,2,'admin@gf.com','2026-08-21 06:00:14.126',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(17,2,'admin@gf.com','2026-08-25 05:37:45.778','2026-08-25 05:43:05.691','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(18,3,'operator@gf.com','2026-08-25 05:43:44.502',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(19,3,'operator@gf.com','2026-08-25 18:06:37.036','2026-08-25 19:48:00.153','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(20,4,'manager@gf.com','2026-08-26 02:53:50.305',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(21,4,'manager@gf.com','2026-08-27 16:04:26.918',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(22,4,'manager@gf.com','2026-08-27 20:06:07.316','2026-08-27 20:19:40.283','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(23,2,'admin@gf.com','2026-08-27 20:20:32.629','2026-08-27 21:18:54.622','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(24,4,'manager@gf.com','2026-08-27 21:19:31.399',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','Desktop','PASSWORD','FAILED','INVALID_COMPANY_CODE'),(25,4,'manager@gf.com','2026-08-27 21:19:49.033','2026-08-28 03:12:03.278','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(26,2,'admin@gf.com','2026-08-28 14:40:51.697',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(27,3,'operator@gf.com','2026-08-28 18:26:52.175',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(28,3,'operator@gf.com','2026-08-28 18:26:55.768',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(29,3,'operator@gf.com','2026-08-28 18:27:03.422',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(30,2,'admin@gf.com','2026-08-29 10:46:59.255',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(31,3,'operator@gf.com','2026-08-29 16:19:43.434',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(32,4,'manager@gf.com','2026-08-29 16:30:39.565',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(33,3,'operator@gf.com','2026-08-29 19:40:49.200',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(34,4,'manager@gf.com','2026-08-29 19:53:50.921',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','Desktop','PASSWORD','FAILED','INVALID_PASSWORD'),(35,3,'operator@gf.com','2026-08-29 19:54:10.665',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(36,2,'admin@gf.com','2026-08-29 19:55:42.178',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(37,3,'operator@gf.com','2026-08-29 20:00:16.525',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(38,3,'operator@gf.com','2026-08-30 17:03:19.322',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(39,2,'admin@gf.com','2026-08-30 17:04:51.788',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','Desktop','PASSWORD','SUCCESS',NULL),(40,3,'operator@gf.com','2026-08-30 17:10:55.045',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','Desktop','PASSWORD','SUCCESS',NULL);
/*!40000 ALTER TABLE `login_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `machine`
--

DROP TABLE IF EXISTS `machine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `machine` (
  `machine_id` int NOT NULL AUTO_INCREMENT,
  `line_id` int NOT NULL,
  `machine_type_id` int NOT NULL,
  `machine_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `machine_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `installation_date` date DEFAULT NULL,
  `layout_x` decimal(18,4) DEFAULT NULL,
  `layout_y` decimal(18,4) DEFAULT NULL,
  `layout_width` decimal(18,4) DEFAULT NULL,
  `layout_height` decimal(18,4) DEFAULT NULL,
  `layout_rotation` decimal(18,4) DEFAULT NULL,
  `location_note` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `operational_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`machine_id`),
  UNIQUE KEY `machine_line_id_machine_code_key` (`line_id`,`machine_code`),
  KEY `machine_line_id_idx` (`line_id`),
  KEY `machine_machine_type_id_idx` (`machine_type_id`),
  KEY `machine_machine_name_idx` (`machine_name`),
  KEY `machine_operational_status_idx` (`operational_status`),
  KEY `machine_status_idx` (`status`),
  CONSTRAINT `machine_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `production_line` (`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `machine_machine_type_id_fkey` FOREIGN KEY (`machine_type_id`) REFERENCES `machine_type` (`machine_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machine`
--

LOCK TABLES `machine` WRITE;
/*!40000 ALTER TABLE `machine` DISABLE KEYS */;
INSERT INTO `machine` VALUES (1,1,8,'SMT-MC-001','SMT Placement Machine 01','Yamaha','YSM20R','GF-SMT-0001','2026-08-18',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-18 19:43:52.440','2026-08-18 19:43:52.440'),(2,1,22,'11111','222','hkoo','hjjkk','111','2026-08-20',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-21 02:53:09.841','2026-08-21 02:53:09.841'),(3,2,14,'MC-A1-001','เครื่องจ่ายวัสดุ A1-01','Nordson ASYMTEK','Spectrum II S2-900','GF-DSP-2026-001','2026-08-27',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 14:50:52.918','2026-08-28 14:50:52.918'),(4,2,15,'MC-A1-002','เครื่องอบชิ้นงาน A1-01','CURING_OVEN Despatch','LAC2-18','GF-COV-2026-001','2026-08-10',NULL,NULL,NULL,NULL,NULL,NULL,'WARNING','ACTIVE','2026-08-28 14:53:26.215','2026-08-28 14:53:26.215'),(5,3,14,'MC-A2-001','เครื่องจ่ายวัสดุ A2-01','Nordson ASYMTEK','Spectrum II S2-900','GF-DSP-2026-002','2026-08-25',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 14:55:26.766','2026-08-28 14:55:26.766'),(6,3,17,'MC-A2-002','เครื่องมาร์กเลเซอร์ A2-01','KEYENCE','MD-X1500','GF-LSR-2026-001','2026-08-26',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 14:56:51.556','2026-08-28 14:56:51.556'),(7,6,18,'MC-A3-001','เครื่องทำความสะอาด PCB A3-01','PBT Works','SuperSWASH III','GF-PCB-2026-001','2026-08-15',NULL,NULL,NULL,NULL,NULL,NULL,'MAINTENANCE','ACTIVE','2026-08-28 15:00:01.977','2026-08-28 15:00:01.977'),(8,8,3,'MC-B1-002','เครื่องตรวจ Solder Paste B1-01','DEK','NeoHorizon 03iX','GF-SPP-2026-001','2026-08-18',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:02:11.479','2026-08-28 15:02:11.479'),(9,5,4,'MC-B2-003','เครื่องตรวจสอบ AOI B2-01','Koh Young','Zenith Alpha','GF-AOI-2026-001','2026-08-20',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:05:42.883','2026-08-28 15:05:42.883'),(10,7,2,'MC-B3-001','เครื่องวางชิ้นส่วน SMT B3-01','Yamaha Motor','YSM20R','GF-PNP-2026-003','2026-08-17',NULL,NULL,NULL,NULL,NULL,NULL,'WARNING','ACTIVE','2026-08-28 15:07:08.300','2026-08-28 15:07:08.300'),(11,7,1,'MC-B3-002','เตา Reflow B3-01','Heller Industries','1809 MK7','GF-RFL-2026-002',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:10:09.689','2026-08-28 15:10:09.689'),(12,9,5,'MC-C1-002','เครื่องบัดกรี Wave C1-01','ERSA','POWERFLOW ULTRA','GF-WSL-2026-001','2026-08-23',NULL,NULL,NULL,NULL,NULL,NULL,'MAINTENANCE','ACTIVE','2026-08-28 15:14:26.953','2026-08-28 15:14:26.953'),(13,10,17,'MC-C2-002','เครื่องมาร์กเลเซอร์ C2-01','KEYENCE','MD-X1500','GF-LSR-2026-002','2026-08-19',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:15:50.419','2026-08-28 15:15:50.419'),(14,11,12,'MC-C3-002','เครื่องตรวจสอบ X-Ray C3-01','Nordson DAGE','Quadra 7','GF-XRY-2026-001','2026-08-26',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:17:01.727','2026-08-28 15:17:01.727'),(15,12,12,'MC-QA1-001','เครื่องตรวจสอบ X-Ray QA1-01','Nordson DAG','Quadra 7','GF-XRY-2026-002','2026-08-21',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:18:23.578','2026-08-28 15:18:23.578'),(16,13,6,'MC-QA2-001','เครื่องทดสอบวงจร QA2-01','Keysight Technologies','i3070','GF-ICT-2026-001','2026-08-26',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:20:01.931','2026-08-28 15:20:01.931'),(17,14,7,'MC-T1-001','เครื่องทดสอบฟังก์ชัน T1-01','National Instruments','PXIe-1085','GF-FTS-2026-001','2026-08-24',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:21:10.741','2026-08-28 15:21:10.741'),(18,14,16,'MC-T1-002','เครื่อง Burn-In T1-01','Micro Control Company','7500 Series','GF-BIN-2026-001','2026-08-25',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:22:21.550','2026-08-28 15:22:21.550'),(19,15,17,'MC-P1-001','เครื่องมาร์กเลเซอร์ P1-01','KEYENCE','MD-X1500','GF-LSR-2026-003','2026-08-17',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:24:19.207','2026-08-28 15:24:19.207'),(20,16,17,'MC-P2-001','เครื่องมาร์กเลเซอร์ P2-01','KEYENCE','MD-X1500','GF-LSR-2026-004','2026-08-21',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:25:31.299','2026-08-28 15:25:31.299'),(21,17,21,'MC-P3-001','เครื่องสำรองไฟ P3-01','Schneider Electric','Galaxy VS','GF-UPS-2026-001','2026-08-16',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:26:39.722','2026-08-28 15:26:39.722'),(22,18,17,'MC-W1-001','เครื่องมาร์กเลเซอร์ W2-01','KEYENCE','MD-X1500','GF-LSR-2026-005','2026-08-15',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:27:58.055','2026-08-28 15:27:58.055'),(23,20,21,'MC-W3-001','เครื่องสำรองไฟ W3-01','Schneider Electric','Galaxy VS','GF-UPS-2026-003','2026-08-19',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:28:56.623','2026-08-28 15:28:56.623'),(24,26,11,'AY-A1-001','เครื่องพิมพ์ Solder Paste A1-01','DEK','NeoHorizon 03iX','GFAY-SPP-2026-001','2026-08-18',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:54:52.790','2026-08-28 15:54:52.790'),(25,27,2,'AY-A2-001','เครื่องวางชิ้นส่วน A2-01','Yamaha Motor','YSM20R','FAY-PNP-2026-002','2026-08-26',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:56:33.582','2026-08-28 15:56:33.582'),(26,28,13,'AY-A3-001','เครื่องบัดกรี A3-01','ERSA','VERSAFLOW 4','GFAY-SSL-2026-001','2026-08-19',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:57:55.563','2026-08-28 15:57:55.563'),(27,28,17,'AY-A3-002','เครื่องมาร์กเลเซอร์ A3-01','KEYENCE','MD-X1500','GFAY-LSR-2026-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 15:58:54.833','2026-08-28 15:58:54.833'),(28,23,4,'AY-Q1-001','เครื่องตรวจสอบ AOI Q1-01','Koh Young','Zenith Alpha','GFAY-AOI-2026-001','2026-08-25',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 16:00:40.789','2026-08-28 16:00:40.789'),(29,24,12,'AY-Q2-001','เครื่องตรวจสอบ X-Ray Q2-01','Nordson DAGE','Quadra 7','GFAY-XRY-2026-001','2026-08-25',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 16:01:39.940','2026-08-28 16:01:39.940'),(30,25,6,'AY-T1-001','เครื่องทดสอบวงจร T1-01','Keysight Technologies','i3070','GFAY-ICT-2026-001','2026-08-08',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 16:03:16.928','2026-08-28 16:03:16.928'),(31,25,7,'AY-T1-002','เครื่องทดสอบฟังก์ชัน T1-01','National Instruments','PXIe-1085','GFAY-FTS-2026-001','2026-08-17',NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 16:04:19.400','2026-08-28 16:04:19.400'),(32,21,21,'AY-W1-001','เครื่องสำรองไฟคลังวัตถุดิบ','Schneider Electric','Galaxy VS','GFAY-UPS-2026-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 16:05:21.436','2026-08-28 16:05:21.436'),(33,22,17,'AY-W2-001','เครื่องมาร์กเลเซอร์จัดส่ง W2-01','KEYENCE','MD-X1500','GFAY-LSR-2026-002',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'NORMAL','ACTIVE','2026-08-28 16:06:18.024','2026-08-28 16:06:18.024');
/*!40000 ALTER TABLE `machine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `machine_type`
--

DROP TABLE IF EXISTS `machine_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `machine_type` (
  `machine_type_id` int NOT NULL AUTO_INCREMENT,
  `machine_type_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `machine_type_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`machine_type_id`),
  UNIQUE KEY `machine_type_machine_type_code_key` (`machine_type_code`),
  KEY `machine_type_status_idx` (`status`),
  KEY `machine_type_machine_type_name_idx` (`machine_type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machine_type`
--

LOCK TABLES `machine_type` WRITE;
/*!40000 ALTER TABLE `machine_type` DISABLE KEYS */;
INSERT INTO `machine_type` VALUES (1,'REFLOW_OVEN','Reflow Oven','เครื่องอบบัดกรีสำหรับสายการผลิต SMT','ACTIVE','2026-07-29 16:03:57.511','2026-08-01 20:19:27.313'),(2,'PICK_AND_PLACE','Pick and Place Machine','เครื่องติดตั้งชิ้นส่วนอิเล็กทรอนิกส์ลงบนแผง PCB','ACTIVE','2026-07-30 21:14:11.377','2026-08-01 20:19:27.305'),(3,'SPI','Solder Paste Inspection','เครื่องตรวจสอบคุณภาพการพิมพ์ Solder Paste','ACTIVE','2026-07-30 21:14:11.384','2026-08-01 20:19:27.293'),(4,'AOI','Automated Optical Inspection','เครื่องตรวจสอบแผงวงจรด้วยระบบภาพอัตโนมัติ','ACTIVE','2026-07-30 21:14:11.392','2026-08-01 20:19:27.320'),(5,'WAVE_SOLDER','Wave Soldering Machine','เครื่องบัดกรีแบบคลื่นสำหรับงานประกอบอิเล็กทรอนิกส์','ACTIVE','2026-07-30 21:14:11.399','2026-08-01 20:19:27.332'),(6,'ICT','In-Circuit Tester','เครื่องทดสอบวงจรไฟฟ้าบนแผง PCB','ACTIVE','2026-07-30 21:14:11.405','2026-08-01 20:19:27.356'),(7,'FUNCTIONAL_TEST','Functional Test System','ระบบทดสอบการทำงานของผลิตภัณฑ์','ACTIVE','2026-07-30 21:14:11.412','2026-08-01 20:19:27.362'),(8,'AIR_COMPRESSOR','Air Compressor','เครื่องอัดอากาศสำหรับระบบลมอัดของโรงงาน','ACTIVE','2026-07-30 21:14:11.419','2026-08-01 20:19:27.386'),(9,'CHILLER','Chiller','เครื่องทำน้ำเย็นสำหรับระบบปรับอากาศและกระบวนการผลิต','ACTIVE','2026-07-30 21:14:11.426','2026-08-01 20:19:27.394'),(10,'GENERATOR','Generator','เครื่องกำเนิดไฟฟ้าสำรอง','ACTIVE','2026-07-30 21:14:11.433','2026-08-01 20:19:27.413'),(11,'SOLDER_PASTE_PRINTER','Solder Paste Printer','เครื่องพิมพ์ Solder Paste ลงบน PCB ในสายการผลิต SMT','ACTIVE','2026-08-01 20:19:27.286','2026-08-01 20:19:27.286'),(12,'X_RAY_INSPECTION','X-Ray Inspection','เครื่องตรวจสอบรอยบัดกรีและชิ้นส่วนภายในด้วยรังสีเอกซ์','ACTIVE','2026-08-01 20:19:27.326','2026-08-01 20:19:27.326'),(13,'SELECTIVE_SOLDER','Selective Soldering Machine','เครื่องบัดกรีเฉพาะจุดสำหรับชิ้นส่วน Through-Hole','ACTIVE','2026-08-01 20:19:27.339','2026-08-01 20:19:27.339'),(14,'DISPENSING_MACHINE','Dispensing Machine','เครื่องจ่ายกาว สารเคมี หรือวัสดุประกอบแบบอัตโนมัติ','ACTIVE','2026-08-01 20:19:27.344','2026-08-01 20:19:27.344'),(15,'CURING_OVEN','Curing Oven','ตู้อบสำหรับกระบวนการ Curing กาว สารเคลือบ หรือวัสดุ','ACTIVE','2026-08-01 20:19:27.350','2026-08-01 20:19:27.350'),(16,'BURN_IN','Burn-In Test System','ระบบทดสอบความทนทานของผลิตภัณฑ์ภายใต้การทำงานต่อเนื่อง','ACTIVE','2026-08-01 20:19:27.368','2026-08-01 20:19:27.368'),(17,'LASER_MARKER','Laser Marking Machine','เครื่องเลเซอร์สำหรับทำเครื่องหมาย Serial, QR หรือข้อมูลผลิตภัณฑ์','ACTIVE','2026-08-01 20:19:27.374','2026-08-01 20:19:27.374'),(18,'PCB_CLEANING','PCB Cleaning Machine','เครื่องทำความสะอาด PCB และสารตกค้างจากกระบวนการบัดกรี','ACTIVE','2026-08-01 20:19:27.380','2026-08-01 20:19:27.380'),(19,'COOLING_TOWER','Cooling Tower','ระบบระบายความร้อนสำหรับ Chiller และระบบหล่อเย็น','ACTIVE','2026-08-01 20:19:27.401','2026-08-01 20:19:27.401'),(20,'AHU','Air Handling Unit','ระบบจ่ายและปรับสภาพอากาศภายในพื้นที่ผลิต','ACTIVE','2026-08-01 20:19:27.407','2026-08-01 20:19:27.407'),(21,'UPS','Uninterruptible Power Supply','ระบบสำรองไฟฟ้าสำหรับอุปกรณ์และสายการผลิตสำคัญ','ACTIVE','2026-08-01 20:19:27.420','2026-08-01 20:19:27.420'),(22,'RO_SYSTEM','RO Water Treatment System','ระบบผลิตน้ำ Reverse Osmosis สำหรับโรงงาน','ACTIVE','2026-08-01 20:19:27.425','2026-08-01 20:19:27.425'),(23,'DI_SYSTEM','DI Water System','ระบบผลิตน้ำ Deionized Water สำหรับกระบวนการผลิต','ACTIVE','2026-08-01 20:19:27.430','2026-08-01 20:19:27.430'),(24,'WWTP','Wastewater Treatment Plant','ระบบบำบัดน้ำเสียของโรงงาน','ACTIVE','2026-08-01 20:19:27.436','2026-08-01 20:19:27.436');
/*!40000 ALTER TABLE `machine_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `notification_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `alert_id` bigint DEFAULT NULL,
  `notification_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`notification_id`),
  KEY `notification_user_id_is_read_created_at_idx` (`user_id`,`is_read`,`created_at`),
  KEY `notification_alert_id_idx` (`alert_id`),
  KEY `notification_priority_idx` (`priority`),
  KEY `notification_notification_type_idx` (`notification_type`),
  CONSTRAINT `notification_alert_id_fkey` FOREIGN KEY (`alert_id`) REFERENCES `alert` (`alert_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `permission_id` int NOT NULL AUTO_INCREMENT,
  `permission_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`permission_id`),
  UNIQUE KEY `permission_permission_code_key` (`permission_code`),
  KEY `permission_group_code_idx` (`group_code`),
  KEY `permission_status_idx` (`status`),
  KEY `permission_sort_order_idx` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES (1,'DASHBOARD','Dashboard','OPERATION','1. การดำเนินงาน','ดูภาพรวมและแดชบอร์ดของระบบ','dashboard',10,'ACTIVE','2026-08-02 01:47:36.368','2026-08-02 01:47:36.368'),(2,'CARBON_RESULT','Carbon Result','OPERATION','1. การดำเนินงาน','ดูผลการคำนวณการปล่อยคาร์บอน','chart',20,'ACTIVE','2026-08-02 01:47:36.379','2026-08-02 01:47:36.379'),(3,'KPI','KPI','OPERATION','1. การดำเนินงาน','ดูและจัดการตัวชี้วัดขององค์กร','target',30,'ACTIVE','2026-08-02 01:47:36.387','2026-08-02 01:47:36.387'),(4,'ALERT','Alert','OPERATION','1. การดำเนินงาน','ดูและจัดการเหตุการณ์แจ้งเตือน','bell',40,'ACTIVE','2026-08-02 01:47:36.392','2026-08-02 01:47:36.392'),(5,'AI_RECOMMENDATION','AI Recommendation','OPERATION','1. การดำเนินงาน','ดูและพิจารณาคำแนะนำจากระบบ AI','sparkles',50,'ACTIVE','2026-08-02 01:47:36.397','2026-08-02 01:47:36.397'),(6,'REPORT_EXPORT','Report & Export','OPERATION','1. การดำเนินงาน','สร้างรายงานและส่งออกข้อมูล','file',60,'ACTIVE','2026-08-02 01:47:36.409','2026-08-02 01:47:36.409'),(7,'COMPANY_MANAGEMENT','จัดการข้อมูลบริษัท','ORGANIZATION','2. การจัดการข้อมูลองค์กร','ดู เพิ่ม แก้ไข และจัดการข้อมูลบริษัท','building',110,'ACTIVE','2026-08-02 01:47:36.415','2026-08-02 01:47:36.415'),(8,'USER_MANAGEMENT','จัดการผู้ใช้งาน','ORGANIZATION','2. การจัดการข้อมูลองค์กร','ดู เพิ่ม แก้ไข และจัดการบัญชีผู้ใช้งาน','users',120,'ACTIVE','2026-08-02 01:47:36.422','2026-08-02 01:47:36.422'),(9,'ROLE_PERMISSION_MANAGEMENT','กำหนดสิทธิ์การใช้งาน','ORGANIZATION','2. การจัดการข้อมูลองค์กร','จัดการบทบาทและสิทธิ์ของผู้ใช้งาน','shield',130,'ACTIVE','2026-08-02 01:47:36.426','2026-08-02 01:47:36.426'),(10,'FACTORY_MANAGEMENT','จัดการข้อมูลโรงงาน','ORGANIZATION','2. การจัดการข้อมูลองค์กร','ดูและจัดการข้อมูลโรงงาน','factory',140,'ACTIVE','2026-08-02 01:47:36.431','2026-08-02 01:47:36.431'),(11,'BUILDING_MANAGEMENT','จัดการอาคาร','ORGANIZATION','2. การจัดการข้อมูลองค์กร','ดูและจัดการอาคารภายในโรงงาน','building',150,'ACTIVE','2026-08-02 01:47:36.435','2026-08-02 01:47:36.435'),(12,'DEPARTMENT_MANAGEMENT','จัดการแผนก','ORGANIZATION','2. การจัดการข้อมูลองค์กร','ดูและจัดการแผนกภายในอาคาร','boxes',160,'ACTIVE','2026-08-02 01:47:36.439','2026-08-02 01:47:36.439'),(13,'PRODUCTION_LINE_MANAGEMENT','จัดการไลน์การผลิต','ORGANIZATION','2. การจัดการข้อมูลองค์กร','ดูและจัดการไลน์การผลิต','factory',170,'ACTIVE','2026-08-02 01:47:36.443','2026-08-02 01:47:36.443'),(14,'MACHINE_MANAGEMENT','จัดการเครื่องจักร','ASSET_IOT','3. เครื่องจักรและ IoT','ดูและจัดการเครื่องจักร','factory',210,'ACTIVE','2026-08-02 01:47:36.447','2026-08-02 01:47:36.447'),(15,'SENSOR_MANAGEMENT','จัดการเซนเซอร์','ASSET_IOT','3. เครื่องจักรและ IoT','ดูและจัดการเซนเซอร์','sensor',220,'ACTIVE','2026-08-02 01:47:36.450','2026-08-02 01:47:36.450'),(16,'QR_CODE_MANAGEMENT','จัดการ QR Code','ASSET_IOT','3. เครื่องจักรและ IoT','สร้าง ยกเลิก และจัดการ QR Code','search',230,'ACTIVE','2026-08-02 01:47:36.454','2026-08-02 01:47:36.454'),(17,'CHECKPOINT_MANAGEMENT','จัดการจุดตรวจ','ASSET_IOT','3. เครื่องจักรและ IoT','ดูและจัดการจุดตรวจภายในโรงงาน','clipboard',240,'ACTIVE','2026-08-02 01:47:36.457','2026-08-02 01:47:36.457'),(18,'RESOURCE_USAGE','บันทึกการใช้ทรัพยากร','ENVIRONMENT','4. ทรัพยากรและสิ่งแวดล้อม','บันทึกและตรวจสอบการใช้ทรัพยากร','zap',310,'ACTIVE','2026-08-02 01:47:36.462','2026-08-02 01:47:36.462'),(19,'RESOURCE_MASTER_DATA','ข้อมูลมาตรฐานทรัพยากร','ENVIRONMENT','4. ทรัพยากรและสิ่งแวดล้อม','จัดการประเภท หมวดหมู่ และหน่วยของทรัพยากร','boxes',320,'ACTIVE','2026-08-02 01:47:36.465','2026-08-02 01:47:36.465'),(20,'EMISSION_FACTOR','Emission Factor','ENVIRONMENT','4. ทรัพยากรและสิ่งแวดล้อม','ดูและจัดการค่าปัจจัยการปล่อย','leaf',330,'ACTIVE','2026-08-02 01:47:36.469','2026-08-02 01:47:36.469'),(21,'AUDIT_LOG','Audit Log','GOVERNANCE','5. การกำกับดูแลระบบ','ตรวจสอบประวัติการเปลี่ยนแปลงข้อมูล','clipboard',410,'ACTIVE','2026-08-02 01:47:36.472','2026-08-02 01:47:36.472'),(22,'LOGIN_LOG','Login Log','GOVERNANCE','5. การกำกับดูแลระบบ','ตรวจสอบประวัติการเข้าสู่ระบบ','search',420,'ACTIVE','2026-08-02 01:47:36.476','2026-08-02 01:47:36.476'),(23,'BACKUP_RESTORE','สำรองและกู้คืนข้อมูล','GOVERNANCE','5. การกำกับดูแลระบบ','จัดการการสำรองและกู้คืนฐานข้อมูล','database',430,'ACTIVE','2026-08-02 01:47:36.479','2026-08-02 01:47:36.479'),(24,'SYSTEM_SETTINGS','ตั้งค่าระบบ','GOVERNANCE','5. การกำกับดูแลระบบ','จัดการการตั้งค่าระดับแพลตฟอร์ม','settings',440,'ACTIVE','2026-08-02 01:47:36.482','2026-08-02 01:47:36.482');
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `production_line`
--

DROP TABLE IF EXISTS `production_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_line` (
  `line_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `line_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `line_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`line_id`),
  UNIQUE KEY `production_line_department_id_line_code_key` (`department_id`,`line_code`),
  KEY `production_line_department_id_idx` (`department_id`),
  KEY `production_line_status_idx` (`status`),
  KEY `production_line_line_name_idx` (`line_name`),
  CONSTRAINT `production_line_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_line`
--

LOCK TABLES `production_line` WRITE;
/*!40000 ALTER TABLE `production_line` DISABLE KEYS */;
INSERT INTO `production_line` VALUES (1,1,'SMT-L01','SMT Line 1','สายการผลิตหลักของแผนก SMT','ACTIVE','2026-08-18 19:33:56.611','2026-08-18 19:33:56.611'),(2,2,'LINE-A1','สายประกอบชิ้นส่วน A1',NULL,'ACTIVE','2026-08-27 20:56:23.734','2026-08-27 20:56:23.734'),(3,2,'LINE-A2','สายประกอบชิ้นส่วน A2',NULL,'ACTIVE','2026-08-27 20:57:03.526','2026-08-27 20:57:03.526'),(5,4,'LINE-B2','สายผลิต PCB B2',NULL,'ACTIVE','2026-08-27 20:58:40.941','2026-08-27 20:58:40.941'),(6,3,'LINE-A3','สายเตรียมวัตถุดิบ A3',NULL,'ACTIVE','2026-08-27 21:00:47.677','2026-08-27 21:00:47.677'),(7,5,'LINE-B3','สายติดตั้ง SMT B3',NULL,'ACTIVE','2026-08-27 21:01:42.004','2026-08-27 21:01:42.004'),(8,4,'LINE-B1','สายผลิต PCB B1',NULL,'ACTIVE','2026-08-27 21:03:17.970','2026-08-27 21:03:17.970'),(9,6,'LINE-C1','สายประกอบผลิตภัณฑ์ C1',NULL,'ACTIVE','2026-08-27 21:04:16.433','2026-08-27 21:04:16.433'),(10,6,'LINE-C2','สายประกอบผลิตภัณฑ์ C2',NULL,'ACTIVE','2026-08-27 21:04:50.513','2026-08-27 21:04:50.513'),(11,7,'LINE-C3','สายตรวจสอบ C3',NULL,'ACTIVE','2026-08-27 21:05:14.045','2026-08-27 21:05:14.045'),(12,8,'LINE-QA1','สายตรวจสอบคุณภาพ QA1',NULL,'ACTIVE','2026-08-27 21:06:01.346','2026-08-27 21:06:01.346'),(13,8,'LINE-QA2','สายตรวจสอบคุณภาพ QA2',NULL,'ACTIVE','2026-08-27 21:07:09.909','2026-08-27 21:07:09.909'),(14,9,'LINE-T1','สายทดสอบผลิตภัณฑ์ T1',NULL,'ACTIVE','2026-08-27 21:07:45.883','2026-08-27 21:07:45.883'),(15,10,'LINE-P1','สายบรรจุภัณฑ์ P1',NULL,'ACTIVE','2026-08-27 21:08:24.789','2026-08-27 21:08:24.789'),(16,10,'LINE-P2','สายบรรจุภัณฑ์ P2',NULL,'ACTIVE','2026-08-27 21:08:56.392','2026-08-27 21:08:56.392'),(17,11,'LINE-P3','สายเตรียมจัดส่ง P3',NULL,'ACTIVE','2026-08-27 21:09:23.189','2026-08-27 21:09:23.189'),(18,12,'LINE-W1','สายรับและคัดแยกวัตถุดิบ W1',NULL,'ACTIVE','2026-08-27 21:10:02.911','2026-08-27 21:10:02.911'),(19,14,'LINE-W2','สายคัดแยกสินค้าสำเร็จรูป W2',NULL,'ACTIVE','2026-08-27 21:11:08.958','2026-08-27 21:11:08.958'),(20,14,'LINE-W3','สายเตรียมสินค้าจัดส่ง W3',NULL,'ACTIVE','2026-08-27 21:11:36.754','2026-08-27 21:11:36.754'),(21,15,'LINE-W1','สายรับและคัดแยกวัตถุดิบ W1',NULL,'ACTIVE','2026-08-28 15:41:28.554','2026-08-28 15:41:28.554'),(22,16,'LINE-W2','สายเตรียมสินค้าจัดส่ง W2',NULL,'ACTIVE','2026-08-28 15:42:06.507','2026-08-28 15:42:06.507'),(23,17,'LINE-Q1','สายตรวจสอบคุณภาพ Q1',NULL,'ACTIVE','2026-08-28 15:45:37.069','2026-08-28 15:45:37.069'),(24,17,'LINE-Q2','สายตรวจสอบคุณภาพ Q2',NULL,'ACTIVE','2026-08-28 15:46:11.363','2026-08-28 15:46:11.363'),(25,18,'LINE-T1','สายทดสอบผลิตภัณฑ์ T1',NULL,'ACTIVE','2026-08-28 15:46:49.450','2026-08-28 15:46:49.450'),(26,19,'LINE-A1','สายการผลิต SMT A1',NULL,'ACTIVE','2026-08-28 15:49:11.569','2026-08-28 15:49:11.569'),(27,19,'LINE-A2','สายการผลิต SMT A2',NULL,'ACTIVE','2026-08-28 15:49:39.276','2026-08-28 15:49:39.276'),(28,20,'LINE-A3','สายประกอบผลิตภัณฑ์ A3',NULL,'ACTIVE','2026-08-28 15:51:31.358','2026-08-28 15:51:31.358');
/*!40000 ALTER TABLE `production_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qr_code`
--

DROP TABLE IF EXISTS `qr_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qr_code` (
  `qr_id` bigint NOT NULL AUTO_INCREMENT,
  `machine_id` int DEFAULT NULL,
  `checkpoint_id` int DEFAULT NULL,
  `qr_code` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_image_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `generated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `revoked_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`qr_id`),
  UNIQUE KEY `qr_code_qr_token_key` (`qr_token`),
  KEY `qr_code_machine_id_idx` (`machine_id`),
  KEY `qr_code_checkpoint_id_idx` (`checkpoint_id`),
  KEY `qr_code_qr_status_idx` (`qr_status`),
  CONSTRAINT `qr_code_checkpoint_id_fkey` FOREIGN KEY (`checkpoint_id`) REFERENCES `checkpoint` (`checkpoint_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `qr_code_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine` (`machine_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qr_code`
--

LOCK TABLES `qr_code` WRITE;
/*!40000 ALTER TABLE `qr_code` DISABLE KEYS */;
INSERT INTO `qr_code` VALUES (1,1,NULL,'SMT-01','28ea5e60-2b8b-4a76-8aa6-9be42941d94f',NULL,'ACTIVE','2026-08-20 17:10:43.224',NULL,'2026-08-20 17:10:43.224','2026-08-20 17:10:43.224'),(2,3,NULL,'QR-GFI-0001','7a9c62c1-159e-4b03-af78-f830a8c41542',NULL,'ACTIVE','2026-08-28 18:14:29.029',NULL,'2026-08-28 18:14:29.029','2026-08-28 18:14:29.029'),(3,6,NULL,'QR-GFI-0002','e2e38a0d-da39-4547-b394-65c9bbec0880',NULL,'ACTIVE','2026-08-28 18:15:08.298',NULL,'2026-08-28 18:15:08.298','2026-08-28 18:15:08.298'),(4,5,NULL,'QR-GFI-0003','60891bf4-f8df-47ca-8092-02e568d0e2f9',NULL,'ACTIVE','2026-08-28 18:16:07.126',NULL,'2026-08-28 18:16:07.126','2026-08-28 18:16:07.126'),(5,6,NULL,'QR-GFI-0004','f9b71ac5-3bb1-4ced-b6df-dea5d6339503',NULL,'ACTIVE','2026-08-28 18:16:47.128',NULL,'2026-08-28 18:16:47.128','2026-08-28 18:16:47.128'),(6,7,NULL,'QR-GFI-0005','c4fd6f02-aa4f-4071-b33b-150ab99fb170',NULL,'ACTIVE','2026-08-28 18:17:16.411',NULL,'2026-08-28 18:17:16.411','2026-08-28 18:17:16.411'),(7,18,NULL,'QR-GFI-0006','110850c0-61a5-439b-9da3-6846555461b6',NULL,'ACTIVE','2026-08-28 18:17:49.736',NULL,'2026-08-28 18:17:49.736','2026-08-28 18:17:49.736'),(8,17,NULL,'QR-GFI-0007','2006e3d0-6ad5-49bd-b9b6-d6d8a18bc919',NULL,'ACTIVE','2026-08-28 18:18:08.621',NULL,'2026-08-28 18:18:08.621','2026-08-28 18:18:08.621'),(9,15,NULL,'QR-GFI-0008','b0eeef3d-f9ff-4375-9e60-8c9b1211b318',NULL,'ACTIVE','2026-08-28 18:18:30.859',NULL,'2026-08-28 18:18:30.859','2026-08-28 18:18:30.859'),(10,17,NULL,'QR-GFI-0009','cbd273f6-8ccd-4486-ba7e-93b5b0cb8b5c',NULL,'ACTIVE','2026-08-28 18:19:16.827',NULL,'2026-08-28 18:19:16.827','2026-08-28 18:19:16.827'),(11,15,NULL,'QR-GFI-0010','7c0623f2-dda6-40ba-8d89-40c7f4799d80',NULL,'ACTIVE','2026-08-28 18:19:56.587',NULL,'2026-08-28 18:19:56.587','2026-08-28 18:19:56.587'),(12,16,NULL,'QR-GFI-0011','5bba2d72-7acf-4002-bf22-7943fd7b6e71',NULL,'ACTIVE','2026-08-28 18:20:22.694',NULL,'2026-08-28 18:20:22.694','2026-08-28 18:20:22.694'),(13,8,NULL,'QR-GFI-0012','d1c5e48c-cea9-4e5b-b589-c4f738eeda43',NULL,'ACTIVE','2026-08-28 18:20:42.655',NULL,'2026-08-28 18:20:42.655','2026-08-28 18:20:42.655'),(14,9,NULL,'QR-GFI-0013','7c736e9c-32a1-485b-8c12-081ffa1a6de3',NULL,'ACTIVE','2026-08-28 18:21:09.821',NULL,'2026-08-28 18:21:09.821','2026-08-28 18:21:09.821'),(15,10,NULL,'QR-GFI-0014','52461a56-1c45-4e15-b630-dfb9517baf29',NULL,'ACTIVE','2026-08-28 18:21:30.745',NULL,'2026-08-28 18:21:30.745','2026-08-28 18:21:30.745'),(16,10,NULL,'QR-GFI-0015','89720706-208c-408b-9407-c4c1c905e4fd',NULL,'ACTIVE','2026-08-28 18:22:25.719',NULL,'2026-08-28 18:22:25.719','2026-08-28 18:22:25.719'),(17,14,NULL,'QR-GFI-0016','e57a22cf-919e-4c80-b7a9-60137285f013',NULL,'ACTIVE','2026-08-28 18:23:27.665',NULL,'2026-08-28 18:23:27.665','2026-08-28 18:23:27.665'),(18,12,NULL,'QR-GFI-0017','ab2ff938-9ef8-4b33-8af4-31984ee3c3ba',NULL,'ACTIVE','2026-08-28 18:24:31.436',NULL,'2026-08-28 18:24:31.436','2026-08-28 18:24:31.436'),(19,13,NULL,'QR-GFI-0018','6b2ab3ae-579d-4c65-aee6-45b71d8e72a5',NULL,'ACTIVE','2026-08-28 18:25:28.982',NULL,'2026-08-28 18:25:28.982','2026-08-28 18:25:28.982'),(20,21,NULL,'QR-GFI-0019','7bc347d6-caad-4424-8ded-6cd4c756ce4e',NULL,'ACTIVE','2026-08-29 15:58:51.475',NULL,'2026-08-29 15:58:51.475','2026-08-29 15:58:51.475'),(21,22,NULL,'QR-GFI-0020','1bd6422e-7b5b-4cc2-9982-4df359135be6',NULL,'ACTIVE','2026-08-29 15:59:38.191',NULL,'2026-08-29 15:59:38.191','2026-08-29 15:59:38.191'),(22,23,NULL,'QR-GFI-0021','144fb2b9-0406-4def-a820-232446efe736',NULL,'ACTIVE','2026-08-29 16:00:38.515',NULL,'2026-08-29 16:00:38.515','2026-08-29 16:00:38.515'),(23,28,NULL,'QR-GFI-0022','e2b927d3-ab81-4c8c-b29c-14a8c059cf66',NULL,'ACTIVE','2026-08-29 16:01:05.287',NULL,'2026-08-29 16:01:05.287','2026-08-29 16:01:05.287'),(24,29,NULL,'QR-GFI-0023','4753561d-50e6-4351-8b00-9804f1c8ea3b',NULL,'ACTIVE','2026-08-29 16:04:40.458',NULL,'2026-08-29 16:04:40.458','2026-08-29 16:04:40.458'),(25,31,NULL,'QR-GFI-0024','7bb02440-39b2-47c6-bdbb-a69742e26cf4',NULL,'ACTIVE','2026-08-29 16:05:24.584',NULL,'2026-08-29 16:05:24.584','2026-08-29 16:05:24.584'),(26,30,NULL,'QR-GFI-0025','5cd87190-f3de-4842-8279-3ba079ab24ca',NULL,'ACTIVE','2026-08-29 16:05:46.106',NULL,'2026-08-29 16:05:46.106','2026-08-29 16:05:46.106'),(27,26,NULL,'QR-GFI-0026','3bb4da6e-dfe4-4036-a255-0563a6da1dc4',NULL,'ACTIVE','2026-08-29 16:07:26.703',NULL,'2026-08-29 16:07:26.703','2026-08-29 16:07:26.703'),(28,27,NULL,'QR-GFI-0027','6c489be8-f350-4fe3-8bd7-a7394ee39131',NULL,'ACTIVE','2026-08-29 16:07:51.995',NULL,'2026-08-29 16:07:51.995','2026-08-29 16:07:51.995'),(29,24,NULL,'QR-GFI-0028','a0dbe93e-d64e-4f4e-9cc0-120ebf40b943',NULL,'ACTIVE','2026-08-29 16:12:06.865',NULL,'2026-08-29 16:12:06.865','2026-08-29 16:12:06.865'),(30,25,NULL,'QR-GFI-0029','5e4c2526-61ec-46a3-961f-85b5f6613ded',NULL,'ACTIVE','2026-08-29 16:15:01.095',NULL,'2026-08-29 16:15:01.095','2026-08-29 16:15:01.095'),(31,33,NULL,'QR-GFI-0030','368429a6-6109-49ce-b53b-28958694f616',NULL,'ACTIVE','2026-08-29 16:16:08.712',NULL,'2026-08-29 16:16:08.712','2026-08-29 16:16:08.712'),(32,32,NULL,'QR-GFI-0031','a84586ac-4241-4c80-b1f2-fda77a4f5a91',NULL,'ACTIVE','2026-08-29 16:16:53.129',NULL,'2026-08-29 16:16:53.129','2026-08-29 16:16:53.129');
/*!40000 ALTER TABLE `qr_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qr_scan_log`
--

DROP TABLE IF EXISTS `qr_scan_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qr_scan_log` (
  `scan_id` bigint NOT NULL AUTO_INCREMENT,
  `qr_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `scan_result` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `scanned_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`scan_id`),
  KEY `qr_scan_log_qr_id_scanned_at_idx` (`qr_id`,`scanned_at`),
  KEY `qr_scan_log_user_id_scanned_at_idx` (`user_id`,`scanned_at`),
  KEY `qr_scan_log_scan_result_idx` (`scan_result`),
  CONSTRAINT `qr_scan_log_qr_id_fkey` FOREIGN KEY (`qr_id`) REFERENCES `qr_code` (`qr_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `qr_scan_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qr_scan_log`
--

LOCK TABLES `qr_scan_log` WRITE;
/*!40000 ALTER TABLE `qr_scan_log` DISABLE KEYS */;
INSERT INTO `qr_scan_log` VALUES (1,1,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',NULL,NULL,NULL,'2026-08-20 19:24:07.280'),(2,1,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',NULL,NULL,NULL,'2026-08-20 19:24:07.281'),(3,1,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',NULL,NULL,NULL,'2026-08-21 01:51:10.843'),(4,1,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',NULL,NULL,NULL,'2026-08-21 01:51:10.844'),(5,1,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',NULL,NULL,NULL,'2026-08-21 02:56:00.869'),(6,1,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',NULL,NULL,NULL,'2026-08-21 02:56:00.876'),(7,1,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',NULL,NULL,NULL,'2026-08-25 10:03:31.329'),(8,1,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',NULL,NULL,NULL,'2026-08-25 10:03:31.329'),(9,1,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',NULL,NULL,NULL,'2026-08-25 10:13:44.287'),(10,1,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',NULL,NULL,NULL,'2026-08-25 10:15:29.451'),(11,1,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',NULL,NULL,NULL,'2026-08-25 15:18:13.474'),(12,1,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',NULL,NULL,NULL,'2026-08-25 15:21:46.193'),(13,19,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0',NULL,NULL,NULL,'2026-08-28 18:27:37.681'),(14,19,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0',NULL,NULL,NULL,'2026-08-28 18:27:51.157'),(15,2,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0',NULL,NULL,NULL,'2026-08-29 20:14:49.331'),(16,2,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0',NULL,NULL,NULL,'2026-08-30 17:13:01.827'),(17,3,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0',NULL,NULL,NULL,'2026-08-30 17:14:17.016'),(18,2,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0',NULL,NULL,NULL,'2026-08-31 05:23:23.350'),(19,2,3,'SUCCESS','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0',NULL,NULL,NULL,'2026-08-31 05:25:51.876');
/*!40000 ALTER TABLE `qr_scan_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `report_id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `factory_id` int DEFAULT NULL,
  `generated_by` int NOT NULL,
  `report_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_format` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `filter_scope` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `report_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REQUESTED',
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `download_count` int NOT NULL DEFAULT '0',
  `requested_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `generated_at` datetime(3) DEFAULT NULL,
  `expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`report_id`),
  KEY `report_company_id_requested_at_idx` (`company_id`,`requested_at`),
  KEY `report_factory_id_requested_at_idx` (`factory_id`,`requested_at`),
  KEY `report_generated_by_requested_at_idx` (`generated_by`,`requested_at`),
  KEY `report_report_type_idx` (`report_type`),
  KEY `report_report_format_idx` (`report_format`),
  KEY `report_report_status_idx` (`report_status`),
  KEY `report_expires_at_idx` (`expires_at`),
  CONSTRAINT `report_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `report_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory` (`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `report_generated_by_fkey` FOREIGN KEY (`generated_by`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report`
--

LOCK TABLES `report` WRITE;
/*!40000 ALTER TABLE `report` DISABLE KEYS */;
/*!40000 ALTER TABLE `report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_category`
--

DROP TABLE IF EXISTS `resource_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource_category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `resource_category_category_code_key` (`category_code`),
  KEY `resource_category_status_idx` (`status`),
  KEY `resource_category_category_name_idx` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_category`
--

LOCK TABLES `resource_category` WRITE;
/*!40000 ALTER TABLE `resource_category` DISABLE KEYS */;
INSERT INTO `resource_category` VALUES (1,'ENERGY','พลังงานและสาธารณูปโภค','พลังงานและระบบสาธารณูปโภคที่ใช้ในเครื่องจักร สายการผลิต อาคาร และระบบสนับสนุน','ACTIVE','2026-07-30 20:38:35.035','2026-08-01 20:19:26.606'),(2,'FUEL','เชื้อเพลิง','เชื้อเพลิงที่ใช้ในการผลิต ระบบสำรอง และการขนส่งภายในโรงงาน','ACTIVE','2026-07-30 21:14:11.149','2026-08-01 20:19:26.631'),(3,'WATER','น้ำ','น้ำที่ใช้ในกระบวนการผลิต ระบบสาธารณูปโภค ระบบหล่อเย็น และการใช้งานภายในโรงงาน','ACTIVE','2026-07-30 21:14:11.158','2026-08-01 20:19:26.643'),(4,'MATERIAL','วัตถุดิบและวัสดุ','โลหะ วัสดุอิเล็กทรอนิกส์ และวัตถุดิบที่ใช้ในกระบวนการผลิต','ACTIVE','2026-07-30 21:14:11.168','2026-08-01 20:19:26.665'),(5,'WASTE','ของเสีย','ของเสียทั่วไป ของเสียรีไซเคิล ของเสียจากการผลิต และของเสียอันตรายที่ต้องติดตาม','ACTIVE','2026-07-30 21:14:11.176','2026-08-01 20:19:26.696'),(6,'WASTEWATER','น้ำเสีย','น้ำเสียจากกระบวนการผลิต ระบบสาธารณูปโภค อาคารสำนักงาน และระบบบำบัดน้ำเสีย','ACTIVE','2026-08-01 20:19:26.655','2026-08-01 20:19:26.655'),(7,'CHEMICAL','สารเคมี','สารเคมี ตัวทำละลาย น้ำยาทำความสะอาด และสารที่ใช้ในกระบวนการผลิตอิเล็กทรอนิกส์','ACTIVE','2026-08-01 20:19:26.674','2026-08-01 20:19:26.674'),(8,'PROCESS_GAS','ก๊าซในกระบวนการ','ก๊าซที่ใช้ในกระบวนการผลิต การบัดกรี การทดสอบ และระบบสนับสนุน','ACTIVE','2026-08-01 20:19:26.680','2026-08-01 20:19:26.680'),(9,'PACKAGING','บรรจุภัณฑ์','วัสดุบรรจุภัณฑ์สำหรับชิ้นส่วน ผลิตภัณฑ์ และการขนส่ง','ACTIVE','2026-08-01 20:19:26.687','2026-08-01 20:19:26.687');
/*!40000 ALTER TABLE `resource_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_record`
--

DROP TABLE IF EXISTS `resource_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource_record` (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `equipment_id` int NOT NULL,
  `recorded_by_id` int NOT NULL,
  `value` double NOT NULL,
  `unit` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','RECORDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RECORDED',
  `recorded_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `attachment_url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`record_id`),
  KEY `resource_record_recorded_by_id_recorded_at_idx` (`recorded_by_id`,`recorded_at`),
  KEY `resource_record_equipment_id_recorded_at_idx` (`equipment_id`,`recorded_at`),
  CONSTRAINT `resource_record_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `resource_record_recorded_by_id_fkey` FOREIGN KEY (`recorded_by_id`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_record`
--

LOCK TABLES `resource_record` WRITE;
/*!40000 ALTER TABLE `resource_record` DISABLE KEYS */;
INSERT INTO `resource_record` VALUES (1,1,3,43,'m3','RECORDED','2026-07-24 07:51:37.675',NULL,NULL),(2,2,3,22.1,'kWh','RECORDED','2026-07-24 07:51:37.685',NULL,NULL),(3,3,3,48.4,'kWh','RECORDED','2026-07-24 07:51:37.692',NULL,NULL),(4,4,3,15.7,'m3','RECORDED','2026-07-24 07:51:37.700',NULL,NULL),(5,5,3,4.2,'kg','RECORDED','2026-07-24 07:51:37.708',NULL,NULL),(6,6,3,38.8,'kg','RECORDED','2026-07-24 07:51:37.714',NULL,NULL),(7,7,3,46.2,'kWh','RECORDED','2026-07-24 07:51:37.720',NULL,NULL),(8,8,3,15.7,'kWh','RECORDED','2026-07-24 07:51:37.726',NULL,NULL),(9,9,3,15,'m3','RECORDED','2026-07-24 07:51:37.738',NULL,NULL),(10,10,3,46.3,'kWh','RECORDED','2026-07-24 07:51:37.745',NULL,NULL),(11,11,3,19.5,'kWh','RECORDED','2026-07-24 07:51:37.751',NULL,NULL),(12,12,3,22.9,'kWh','RECORDED','2026-07-24 07:51:37.756',NULL,NULL),(13,13,3,40.1,'m3','RECORDED','2026-07-24 07:51:37.763',NULL,NULL),(14,14,3,43.7,'m3','RECORDED','2026-07-24 07:51:37.770',NULL,NULL),(15,15,3,39.8,'m3','RECORDED','2026-07-24 07:51:37.777',NULL,NULL),(16,16,3,45.3,'m3','RECORDED','2026-07-24 07:51:37.784',NULL,NULL),(17,17,3,18.2,'L','RECORDED','2026-07-24 07:51:37.790',NULL,NULL),(18,18,3,48.4,'kg','RECORDED','2026-07-24 07:51:37.797',NULL,NULL),(19,19,3,34.8,'m3','RECORDED','2026-07-24 07:51:37.807',NULL,NULL),(20,15,3,0,'m3','RECORDED','2026-08-21 02:56:00.000',NULL,NULL);
/*!40000 ALTER TABLE `resource_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_type`
--

DROP TABLE IF EXISTS `resource_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource_type` (
  `resource_type_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `default_unit_id` int NOT NULL,
  `resource_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `carbon_calculable` tinyint(1) NOT NULL DEFAULT '0',
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`resource_type_id`),
  UNIQUE KEY `resource_type_resource_code_key` (`resource_code`),
  KEY `resource_type_category_id_idx` (`category_id`),
  KEY `resource_type_default_unit_id_idx` (`default_unit_id`),
  KEY `resource_type_status_idx` (`status`),
  KEY `resource_type_resource_name_idx` (`resource_name`),
  KEY `resource_type_carbon_calculable_idx` (`carbon_calculable`),
  CONSTRAINT `resource_type_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `resource_category` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `resource_type_default_unit_id_fkey` FOREIGN KEY (`default_unit_id`) REFERENCES `unit` (`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_type`
--

LOCK TABLES `resource_type` WRITE;
/*!40000 ALTER TABLE `resource_type` DISABLE KEYS */;
INSERT INTO `resource_type` VALUES (1,1,1,'ELECTRICITY','ไฟฟ้า','พลังงานไฟฟ้าที่ใช้ในเครื่องจักร สายการผลิต อาคาร และระบบสนับสนุน',1,'ACTIVE','2026-07-30 20:40:53.729','2026-08-01 20:19:26.848'),(2,2,4,'DIESEL','น้ำมันดีเซล','น้ำมันดีเซลสำหรับเครื่องกำเนิดไฟฟ้า ยานพาหนะ หรืออุปกรณ์ภายในโรงงาน',1,'ACTIVE','2026-07-30 21:14:11.298','2026-08-01 20:19:26.891'),(3,2,6,'LPG','ก๊าซปิโตรเลียมเหลว (LPG)','เชื้อเพลิง LPG ที่ใช้ในกระบวนการผลิตหรือระบบสนับสนุน',1,'ACTIVE','2026-07-30 21:14:11.305','2026-08-01 20:19:26.905'),(4,2,5,'NATURAL_GAS','ก๊าซธรรมชาติ','ก๊าซธรรมชาติที่ใช้เป็นเชื้อเพลิงในกระบวนการผลิตหรือระบบสาธารณูปโภค',1,'ACTIVE','2026-07-30 21:14:11.312','2026-08-01 20:19:26.912'),(5,3,5,'WATER','น้ำประปา / น้ำใช้','ปริมาณน้ำที่ใช้ในกระบวนการผลิต ระบบสาธารณูปโภค และพื้นที่สำนักงาน',0,'ACTIVE','2026-07-30 21:14:11.319','2026-07-30 21:14:11.319'),(6,1,5,'COMPRESSED_AIR','ลมอัด','ปริมาณลมอัดที่ใช้กับเครื่องจักรและอุปกรณ์ในสายการผลิต',0,'ACTIVE','2026-07-30 21:14:11.326','2026-08-01 20:19:26.868'),(7,1,6,'STEAM','ไอน้ำ','ไอน้ำที่ใช้ในกระบวนการผลิตหรือระบบสาธารณูปโภค',1,'ACTIVE','2026-07-30 21:14:11.333','2026-08-01 20:19:26.876'),(8,4,6,'RAW_MATERIAL','วัตถุดิบการผลิต','วัตถุดิบหลักที่ใช้ในกระบวนการผลิตอิเล็กทรอนิกส์',0,'ACTIVE','2026-07-30 21:14:11.340','2026-08-01 20:19:26.991'),(9,5,6,'GENERAL_WASTE','ของเสียทั่วไป','ของเสียทั่วไปที่เกิดจากกิจกรรมภายในโรงงาน',0,'ACTIVE','2026-07-30 21:14:11.346','2026-08-01 20:19:27.208'),(10,5,6,'HAZARDOUS_WASTE','ของเสียอันตราย','ของเสียอันตรายจากกระบวนการผลิตที่ต้องติดตามและจัดการเป็นพิเศษ',0,'ACTIVE','2026-07-30 21:14:11.353','2026-08-01 20:19:27.269'),(11,1,1,'SOLAR_ELECTRICITY','ไฟฟ้าจากพลังงานแสงอาทิตย์','พลังงานไฟฟ้าที่ผลิตจากระบบ Solar PV ภายในโรงงาน',1,'ACTIVE','2026-08-01 20:19:26.856','2026-08-01 20:19:26.856'),(12,1,5,'CHILLED_WATER','น้ำเย็นระบบ Chilled Water','น้ำเย็นหมุนเวียนที่ใช้ในระบบปรับอากาศและกระบวนการผลิต',0,'ACTIVE','2026-08-01 20:19:26.884','2026-08-01 20:19:26.884'),(13,2,4,'GASOLINE','น้ำมันเบนซิน','น้ำมันเบนซินสำหรับยานพาหนะหรืออุปกรณ์ภายในโรงงาน',1,'ACTIVE','2026-08-01 20:19:26.898','2026-08-01 20:19:26.898'),(14,3,5,'TAP_WATER','น้ำประปา','น้ำประปาที่ใช้ในกระบวนการผลิต อาคารสำนักงาน และระบบสาธารณูปโภค',0,'ACTIVE','2026-08-01 20:19:26.919','2026-08-01 20:19:26.919'),(15,3,5,'GROUNDWATER','น้ำบาดาล','น้ำบาดาลที่นำมาใช้ในโรงงานหรือผ่านกระบวนการปรับปรุงคุณภาพ',0,'ACTIVE','2026-08-01 20:19:26.926','2026-08-01 20:19:26.926'),(16,3,5,'RO_WATER','น้ำ RO','น้ำที่ผ่านระบบ Reverse Osmosis สำหรับกระบวนการผลิตหรือระบบสนับสนุน',0,'ACTIVE','2026-08-01 20:19:26.937','2026-08-01 20:19:26.937'),(17,3,5,'DI_WATER','น้ำ DI','น้ำปราศจากไอออนสำหรับกระบวนการผลิตอิเล็กทรอนิกส์และงานทำความสะอาด',0,'ACTIVE','2026-08-01 20:19:26.944','2026-08-01 20:19:26.944'),(18,3,5,'PROCESS_WATER','น้ำในกระบวนการผลิต','น้ำที่ใช้โดยตรงในกระบวนการผลิต',0,'ACTIVE','2026-08-01 20:19:26.950','2026-08-01 20:19:26.950'),(19,3,5,'COOLING_WATER','น้ำหล่อเย็น','น้ำที่ใช้ใน Cooling Tower หรือระบบหล่อเย็นของเครื่องจักร',0,'ACTIVE','2026-08-01 20:19:26.957','2026-08-01 20:19:26.957'),(20,6,5,'INDUSTRIAL_WASTEWATER','น้ำเสียอุตสาหกรรม','น้ำเสียที่เกิดจากกระบวนการผลิตและกิจกรรมอุตสาหกรรม',0,'ACTIVE','2026-08-01 20:19:26.963','2026-08-01 20:19:26.963'),(21,6,5,'PROCESS_WASTEWATER','น้ำเสียจากกระบวนการผลิต','น้ำเสียที่เกิดโดยตรงจากขั้นตอนการผลิตหรือการทำความสะอาดชิ้นงาน',0,'ACTIVE','2026-08-01 20:19:26.971','2026-08-01 20:19:26.971'),(22,6,5,'CHEMICAL_WASTEWATER','น้ำเสียปนเปื้อนสารเคมี','น้ำเสียที่มีสารเคมีจากกระบวนการผลิต การล้าง หรือการบำบัด',0,'ACTIVE','2026-08-01 20:19:26.977','2026-08-01 20:19:26.977'),(23,6,5,'DOMESTIC_WASTEWATER','น้ำเสียจากอาคารและสำนักงาน','น้ำเสียจากห้องน้ำ โรงอาหาร สำนักงาน และกิจกรรมทั่วไปภายในโรงงาน',0,'ACTIVE','2026-08-01 20:19:26.985','2026-08-01 20:19:26.985'),(24,4,6,'COPPER','ทองแดง','ทองแดงที่ใช้ในสายไฟ ขั้วต่อ แผงวงจร บัสบาร์ และชิ้นส่วนอิเล็กทรอนิกส์',0,'ACTIVE','2026-08-01 20:19:27.000','2026-08-01 20:19:27.000'),(25,4,6,'BRASS','ทองเหลือง','ทองเหลืองที่ใช้ในขั้วต่อ ฟิตติ้ง วาล์ว และชิ้นส่วนโลหะ',0,'ACTIVE','2026-08-01 20:19:27.006','2026-08-01 20:19:27.006'),(26,4,6,'ALUMINUM','อะลูมิเนียม','อะลูมิเนียมที่ใช้ในโครงสร้าง ฮีตซิงก์ ตัวเรือน และชิ้นส่วนการผลิต',0,'ACTIVE','2026-08-01 20:19:27.013','2026-08-01 20:19:27.013'),(27,4,6,'STEEL','เหล็ก','เหล็กที่ใช้ในโครงสร้าง เครื่องจักร อุปกรณ์ และชิ้นส่วน',0,'ACTIVE','2026-08-01 20:19:27.019','2026-08-01 20:19:27.019'),(28,4,6,'STAINLESS_STEEL','สแตนเลส','สแตนเลสที่ใช้ในอุปกรณ์ โครงสร้าง ท่อ และชิ้นส่วนที่ต้องการความทนทานต่อการกัดกร่อน',0,'ACTIVE','2026-08-01 20:19:27.025','2026-08-01 20:19:27.025'),(29,4,6,'TIN','ดีบุก','ดีบุกที่ใช้เป็นวัตถุดิบหรือส่วนประกอบในงานบัดกรีและการผลิตอิเล็กทรอนิกส์',0,'ACTIVE','2026-08-01 20:19:27.032','2026-08-01 20:19:27.032'),(30,4,6,'NICKEL','นิกเกิล','นิกเกิลที่ใช้ในการชุบผิว โลหะผสม และชิ้นส่วนอิเล็กทรอนิกส์',0,'ACTIVE','2026-08-01 20:19:27.038','2026-08-01 20:19:27.038'),(31,4,6,'ZINC','สังกะสี','สังกะสีที่ใช้ในการชุบผิว โลหะผสม หรือชิ้นส่วน',0,'ACTIVE','2026-08-01 20:19:27.045','2026-08-01 20:19:27.045'),(32,4,6,'SILVER','เงิน','เงินที่ใช้ในหน้าสัมผัส ตัวนำ และวัสดุอิเล็กทรอนิกส์',0,'ACTIVE','2026-08-01 20:19:27.050','2026-08-01 20:19:27.050'),(33,4,6,'SOLDER','ลวดบัดกรี / Solder','วัสดุบัดกรีที่ใช้ในกระบวนการ SMT, Wave Solder และงานประกอบอิเล็กทรอนิกส์',0,'ACTIVE','2026-08-01 20:19:27.056','2026-08-01 20:19:27.056'),(34,4,6,'SOLDER_PASTE','Solder Paste','ครีมบัดกรีสำหรับกระบวนการ SMT และการประกอบ PCB',0,'ACTIVE','2026-08-01 20:19:27.063','2026-08-01 20:19:27.063'),(35,4,11,'PCB','แผงวงจรพิมพ์ (PCB)','แผงวงจรพิมพ์ที่ใช้เป็นวัตถุดิบหลักในการประกอบผลิตภัณฑ์อิเล็กทรอนิกส์',0,'ACTIVE','2026-08-01 20:19:27.069','2026-08-01 20:19:27.069'),(36,4,11,'ELECTRONIC_COMPONENT','ชิ้นส่วนอิเล็กทรอนิกส์','IC, Resistor, Capacitor, Connector และชิ้นส่วนอิเล็กทรอนิกส์อื่น',0,'ACTIVE','2026-08-01 20:19:27.075','2026-08-01 20:19:27.075'),(37,4,6,'PLASTIC','พลาสติก','วัสดุพลาสติกที่ใช้ในชิ้นส่วน ตัวเรือน และกระบวนการผลิต',0,'ACTIVE','2026-08-01 20:19:27.082','2026-08-01 20:19:27.082'),(38,7,4,'IPA','Isopropyl Alcohol (IPA)','IPA สำหรับทำความสะอาด PCB อุปกรณ์ และพื้นผิวในกระบวนการผลิต',0,'ACTIVE','2026-08-01 20:19:27.088','2026-08-01 20:19:27.088'),(39,7,4,'ACETONE','Acetone','ตัวทำละลายที่ใช้ในงานทำความสะอาดหรือกระบวนการเฉพาะ',0,'ACTIVE','2026-08-01 20:19:27.095','2026-08-01 20:19:27.095'),(40,7,4,'FLUX','Flux','สารช่วยบัดกรีที่ใช้ใน SMT, Wave Solder และงานประกอบอิเล็กทรอนิกส์',0,'ACTIVE','2026-08-01 20:19:27.105','2026-08-01 20:19:27.105'),(41,7,4,'CLEANING_SOLVENT','น้ำยาทำความสะอาด / Cleaning Solvent','สารทำความสะอาดเครื่องจักร PCB และชิ้นส่วนในกระบวนการผลิต',0,'ACTIVE','2026-08-01 20:19:27.112','2026-08-01 20:19:27.112'),(42,7,4,'ACID','สารละลายกรด','สารละลายกรดที่ใช้ในกระบวนการผลิต การปรับสภาพ หรือระบบบำบัด',0,'ACTIVE','2026-08-01 20:19:27.118','2026-08-01 20:19:27.118'),(43,7,4,'ALKALI','สารละลายด่าง','สารละลายด่างที่ใช้ในกระบวนการผลิต การทำความสะอาด หรือระบบบำบัด',0,'ACTIVE','2026-08-01 20:19:27.127','2026-08-01 20:19:27.127'),(44,7,6,'ADHESIVE','กาวอุตสาหกรรม / Adhesive','กาวสำหรับยึดชิ้นส่วนอิเล็กทรอนิกส์และงานประกอบ',0,'ACTIVE','2026-08-01 20:19:27.137','2026-08-01 20:19:27.137'),(45,8,5,'NITROGEN','ไนโตรเจน (N₂)','ก๊าซไนโตรเจนที่ใช้ในกระบวนการ Reflow, Wave Solder หรือกระบวนการควบคุมบรรยากาศ',0,'ACTIVE','2026-08-01 20:19:27.145','2026-08-01 20:19:27.145'),(46,8,5,'OXYGEN','ออกซิเจน (O₂)','ก๊าซออกซิเจนสำหรับกระบวนการหรือระบบสนับสนุนเฉพาะ',0,'ACTIVE','2026-08-01 20:19:27.152','2026-08-01 20:19:27.152'),(47,8,5,'ARGON','อาร์กอน (Ar)','ก๊าซอาร์กอนสำหรับกระบวนการผลิตหรือการทดสอบเฉพาะ',0,'ACTIVE','2026-08-01 20:19:27.158','2026-08-01 20:19:27.158'),(48,8,6,'PROCESS_CO2','คาร์บอนไดออกไซด์ในกระบวนการ (CO₂)','ก๊าซคาร์บอนไดออกไซด์ที่ใช้ในกระบวนการหรือระบบสนับสนุน',0,'ACTIVE','2026-08-01 20:19:27.165','2026-08-01 20:19:27.165'),(49,9,6,'CARTON','กล่องกระดาษ','กล่องกระดาษสำหรับบรรจุผลิตภัณฑ์ ชิ้นส่วน และการขนส่ง',0,'ACTIVE','2026-08-01 20:19:27.173','2026-08-01 20:19:27.173'),(50,9,6,'PAPER','กระดาษ','กระดาษสำหรับบรรจุภัณฑ์ เอกสาร หรือวัสดุรองกันกระแทก',0,'ACTIVE','2026-08-01 20:19:27.182','2026-08-01 20:19:27.182'),(51,9,6,'PLASTIC_PACKAGING','บรรจุภัณฑ์พลาสติก','ฟิล์ม ถุง พลาสติกกันกระแทก และบรรจุภัณฑ์พลาสติก',0,'ACTIVE','2026-08-01 20:19:27.188','2026-08-01 20:19:27.188'),(52,9,11,'ESD_BAG','ถุง ESD','ถุงป้องกันไฟฟ้าสถิตสำหรับชิ้นส่วนและผลิตภัณฑ์อิเล็กทรอนิกส์',0,'ACTIVE','2026-08-01 20:19:27.195','2026-08-01 20:19:27.195'),(53,9,14,'WOODEN_PALLET','พาเลทไม้','พาเลทไม้สำหรับจัดเก็บและขนส่งวัตถุดิบหรือผลิตภัณฑ์',0,'ACTIVE','2026-08-01 20:19:27.202','2026-08-01 20:19:27.202'),(54,5,6,'RECYCLABLE_WASTE','ของเสียรีไซเคิล','กระดาษ พลาสติก โลหะ และวัสดุที่สามารถนำกลับมาใช้หรือรีไซเคิลได้',0,'ACTIVE','2026-08-01 20:19:27.215','2026-08-01 20:19:27.215'),(55,5,6,'E_WASTE','ขยะอิเล็กทรอนิกส์ (E-Waste)','ชิ้นส่วน แผงวงจร อุปกรณ์ และผลิตภัณฑ์อิเล็กทรอนิกส์ที่เป็นของเสีย',0,'ACTIVE','2026-08-01 20:19:27.221','2026-08-01 20:19:27.221'),(56,5,6,'SCRAP_METAL','เศษโลหะ','เศษทองแดง อะลูมิเนียม เหล็ก และโลหะจากกระบวนการผลิต',0,'ACTIVE','2026-08-01 20:19:27.227','2026-08-01 20:19:27.227'),(57,5,6,'PCB_WASTE','ของเสีย PCB','แผงวงจรพิมพ์ที่เสียหาย ไม่ผ่านการตรวจสอบ หรือถูกคัดทิ้ง',0,'ACTIVE','2026-08-01 20:19:27.234','2026-08-01 20:19:27.234'),(58,5,6,'CHEMICAL_WASTE','ของเสียสารเคมี','สารเคมีใช้แล้ว ตัวทำละลาย และของเสียจากกระบวนการเคมี',0,'ACTIVE','2026-08-01 20:19:27.242','2026-08-01 20:19:27.242'),(59,5,4,'WASTE_OIL','น้ำมันใช้แล้ว','น้ำมันหล่อลื่น น้ำมันเครื่อง และน้ำมันอุตสาหกรรมที่ใช้แล้ว',0,'ACTIVE','2026-08-01 20:19:27.254','2026-08-01 20:19:27.254'),(60,5,6,'SLUDGE','ตะกอนจากระบบบำบัด','ตะกอนจากระบบบำบัดน้ำเสียหรือกระบวนการผลิต',0,'ACTIVE','2026-08-01 20:19:27.261','2026-08-01 20:19:27.261');
/*!40000 ALTER TABLE `resource_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_usage`
--

DROP TABLE IF EXISTS `resource_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource_usage` (
  `usage_id` bigint NOT NULL AUTO_INCREMENT,
  `usage_reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` int NOT NULL,
  `factory_id` int DEFAULT NULL,
  `building_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `line_id` int DEFAULT NULL,
  `machine_id` int DEFAULT NULL,
  `checkpoint_id` int DEFAULT NULL,
  `resource_type_id` int NOT NULL,
  `unit_id` int NOT NULL,
  `sensor_data_id` bigint DEFAULT NULL,
  `qr_scan_id` bigint DEFAULT NULL,
  `scope_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(18,6) NOT NULL,
  `usage_at` datetime(3) NOT NULL,
  `source_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `evidence_file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remark` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recorded_by` int NOT NULL,
  `processing_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`usage_id`),
  UNIQUE KEY `resource_usage_usage_reference_key` (`usage_reference`),
  KEY `resource_usage_company_id_usage_at_idx` (`company_id`,`usage_at`),
  KEY `resource_usage_factory_id_usage_at_idx` (`factory_id`,`usage_at`),
  KEY `resource_usage_building_id_usage_at_idx` (`building_id`,`usage_at`),
  KEY `resource_usage_department_id_usage_at_idx` (`department_id`,`usage_at`),
  KEY `resource_usage_line_id_usage_at_idx` (`line_id`,`usage_at`),
  KEY `resource_usage_machine_id_usage_at_idx` (`machine_id`,`usage_at`),
  KEY `resource_usage_checkpoint_id_usage_at_idx` (`checkpoint_id`,`usage_at`),
  KEY `resource_usage_resource_type_id_usage_at_idx` (`resource_type_id`,`usage_at`),
  KEY `resource_usage_unit_id_idx` (`unit_id`),
  KEY `resource_usage_sensor_data_id_idx` (`sensor_data_id`),
  KEY `resource_usage_qr_scan_id_idx` (`qr_scan_id`),
  KEY `resource_usage_recorded_by_usage_at_idx` (`recorded_by`,`usage_at`),
  KEY `resource_usage_scope_type_idx` (`scope_type`),
  KEY `resource_usage_source_type_idx` (`source_type`),
  KEY `resource_usage_processing_status_idx` (`processing_status`),
  KEY `resource_usage_status_idx` (`status`),
  CONSTRAINT `resource_usage_building_id_fkey` FOREIGN KEY (`building_id`) REFERENCES `building` (`building_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `resource_usage_checkpoint_id_fkey` FOREIGN KEY (`checkpoint_id`) REFERENCES `checkpoint` (`checkpoint_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `resource_usage_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `resource_usage_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `resource_usage_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory` (`factory_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `resource_usage_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `production_line` (`line_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `resource_usage_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine` (`machine_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `resource_usage_qr_scan_id_fkey` FOREIGN KEY (`qr_scan_id`) REFERENCES `qr_scan_log` (`scan_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `resource_usage_recorded_by_fkey` FOREIGN KEY (`recorded_by`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `resource_usage_resource_type_id_fkey` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_type` (`resource_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `resource_usage_sensor_data_id_fkey` FOREIGN KEY (`sensor_data_id`) REFERENCES `sensor_data` (`sensor_data_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `resource_usage_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_usage`
--

LOCK TABLES `resource_usage` WRITE;
/*!40000 ALTER TABLE `resource_usage` DISABLE KEYS */;
INSERT INTO `resource_usage` VALUES (1,'USG-1787671155118-C13F9C3BF4',1,3,1,1,1,1,NULL,40,4,NULL,11,'MACHINE',0.040000,'2026-08-25 15:18:00.000','QR','/uploads/records/3-a9aa4916-0a4a-4c7a-9791-bae89a8398a1.png',NULL,3,'PENDING','ACTIVE','2026-08-25 15:19:15.126','2026-08-25 15:19:15.126'),(2,'USG-1787671340984-4B7F043F68',1,3,1,1,1,1,NULL,50,6,NULL,12,'MACHINE',1.940000,'2026-08-25 15:21:00.000','QR','/uploads/records/3-7b7d391f-6991-4556-bcd6-046375118956.jpg',NULL,3,'PENDING','ACTIVE','2026-08-25 15:22:20.989','2026-08-25 15:22:20.989'),(3,'USG-1787684353940-AEB517FCA6',1,3,1,1,1,1,NULL,54,6,NULL,NULL,'MACHINE',30.000000,'2026-08-24 18:58:00.000','MANUAL','/uploads/records/3-ee7370ea-2b05-41fe-90aa-dd0b7b796e9e.jpg',NULL,3,'PENDING','ACTIVE','2026-08-25 18:59:13.950','2026-08-25 18:59:13.950'),(4,'USG-1787684637063-23AFE729ED',1,3,1,1,1,1,NULL,10,6,NULL,NULL,'MACHINE',111.560000,'2026-08-24 19:03:00.000','MANUAL','/uploads/records/3-5e255aa0-47d5-4401-9154-61be9841b3a0.jpg',NULL,3,'PENDING','ACTIVE','2026-08-25 19:03:57.066','2026-08-25 19:03:57.066'),(5,'USG-1788155166850-F764100213',1,3,1,2,2,3,NULL,44,6,NULL,19,'MACHINE',48.200000,'2026-08-31 05:25:00.000','QR',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 05:46:06.864','2026-08-31 05:46:06.864'),(6,'USG-1788155205205-E64DCF8A10',1,3,1,2,3,5,NULL,44,6,NULL,NULL,'MACHINE',51.660000,'2026-08-31 05:46:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 05:46:45.214','2026-08-31 05:46:45.214'),(7,'USG-1788155565412-A679C81492',1,3,2,4,8,8,NULL,1,1,NULL,NULL,'MACHINE',18.400000,'2026-08-31 05:46:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 05:52:45.417','2026-08-31 05:52:45.417'),(8,'USG-1788155822928-D29482D683',1,3,4,9,14,18,NULL,1,1,NULL,NULL,'MACHINE',82.400000,'2026-08-31 05:54:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 05:57:02.934','2026-08-31 05:57:02.934'),(9,'USG-1788155857660-AF443DF71B',1,3,2,4,5,9,NULL,1,1,NULL,NULL,'MACHINE',18.500000,'2026-08-31 05:57:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 05:57:37.667','2026-08-31 05:57:37.667'),(10,'USG-1788155899217-D2AF3599FA',1,4,8,17,23,28,NULL,1,1,NULL,NULL,'MACHINE',15.750000,'2026-08-31 05:57:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 05:58:19.225','2026-08-31 05:58:19.225'),(11,'USG-1788155939619-064F6963C6',1,3,3,7,11,14,NULL,1,1,NULL,NULL,'MACHINE',42.600000,'2026-08-31 05:58:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 05:58:59.627','2026-08-31 05:58:59.627'),(12,'USG-1788155962859-FF4EE4CAA8',1,4,8,17,24,29,NULL,1,1,NULL,NULL,'MACHINE',39.850000,'2026-08-31 05:59:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 05:59:22.862','2026-08-31 05:59:22.862'),(13,'USG-1788156010299-510E15A1D5',1,3,4,8,12,15,NULL,1,1,NULL,NULL,'MACHINE',44.220000,'2026-08-31 05:59:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:00:10.303','2026-08-31 06:00:10.303'),(14,'USG-1788156044896-2668F23BEA',1,4,8,18,25,31,NULL,1,1,NULL,NULL,'MACHINE',22.810000,'2026-08-31 06:00:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:00:44.901','2026-08-31 06:00:44.901'),(15,'USG-1788156099662-8EACB35C67',1,3,4,9,14,17,NULL,1,1,NULL,NULL,'MACHINE',27.200000,'2026-08-31 06:00:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:01:39.666','2026-08-31 06:01:39.666'),(16,'USG-1788156127887-D5D7B1FA9F',1,3,4,8,13,16,NULL,1,1,NULL,NULL,'MACHINE',15.400000,'2026-08-31 06:01:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:02:07.894','2026-08-31 06:02:07.894'),(17,'USG-1788156157771-FD19CEA5A3',1,4,8,18,25,30,NULL,1,1,NULL,NULL,'MACHINE',13.350000,'2026-08-31 06:02:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:02:37.774','2026-08-31 06:02:37.774'),(18,'USG-1788156191332-59D9B0F061',1,3,1,3,6,7,NULL,17,5,NULL,NULL,'MACHINE',185.160000,'2026-08-31 06:02:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:03:11.340','2026-08-31 06:03:11.340'),(19,'USG-1788156223431-4D6501E430',1,4,7,20,28,26,NULL,33,6,NULL,NULL,'MACHINE',3.600000,'2026-08-31 06:03:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:03:43.437','2026-08-31 06:03:43.437'),(20,'USG-1788156252940-06A504362B',1,3,3,6,9,12,NULL,33,6,NULL,NULL,'MACHINE',7.800000,'2026-08-31 06:03:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:04:12.945','2026-08-31 06:04:12.945'),(21,'USG-1788156285423-6D319897F5',1,4,7,19,26,24,NULL,34,6,NULL,NULL,'MACHINE',2.450000,'2026-08-31 06:04:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:04:45.427','2026-08-31 06:04:45.427'),(22,'USG-1788156314784-6099B24B52',1,3,1,2,3,6,NULL,1,1,NULL,NULL,'MACHINE',9.750000,'2026-08-31 06:04:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:05:14.787','2026-08-31 06:05:14.787'),(23,'USG-1788156352811-6F3F6D38EC',1,4,7,20,28,27,NULL,1,1,NULL,NULL,'MACHINE',10.200000,'2026-08-31 06:05:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:05:52.816','2026-08-31 06:05:52.816'),(24,'USG-1788156388632-4D9009F43F',1,3,3,6,10,13,NULL,1,1,NULL,NULL,'MACHINE',11.100000,'2026-08-31 06:05:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:06:28.639','2026-08-31 06:06:28.639'),(25,'USG-1788156425474-E579F21B8C',1,3,5,10,15,19,NULL,1,1,NULL,NULL,'MACHINE',8.600000,'2026-08-31 06:06:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:07:05.479','2026-08-31 06:07:05.479'),(26,'USG-1788156448564-69B50D28E7',1,3,5,10,16,20,NULL,1,1,NULL,NULL,'MACHINE',13.900000,'2026-08-31 06:07:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:07:28.569','2026-08-31 06:07:28.569'),(27,'USG-1788156599675-B4F356EE19',1,3,6,12,18,22,NULL,1,1,NULL,NULL,'MACHINE',7.900000,'2026-08-31 06:07:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:09:59.681','2026-08-31 06:09:59.681'),(28,'USG-1788156627836-BC99EF394D',1,4,9,16,22,33,NULL,1,1,NULL,NULL,'MACHINE',6.850000,'2026-08-31 06:10:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:10:27.840','2026-08-31 06:10:27.840'),(29,'USG-1788156705809-12354B173F',1,4,7,19,27,25,NULL,1,1,NULL,NULL,'MACHINE',32.600000,'2026-08-31 06:10:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:11:45.812','2026-08-31 06:11:45.812'),(30,'USG-1788156738435-0D2F74C09F',1,3,5,11,17,21,NULL,1,1,NULL,NULL,'MACHINE',21.240000,'2026-08-31 06:11:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:12:18.439','2026-08-31 06:12:18.439'),(31,'USG-1788156768852-E221BF127F',1,3,2,5,7,11,NULL,1,1,NULL,NULL,'MACHINE',68.500000,'2026-08-31 06:12:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:12:48.857','2026-08-31 06:12:48.857'),(32,'USG-1788156830744-3362DFFEF2',1,3,2,5,7,10,NULL,1,1,NULL,NULL,'MACHINE',34.250000,'2026-08-31 06:13:00.000','MANUAL',NULL,NULL,3,'PENDING','ACTIVE','2026-08-31 06:13:50.751','2026-08-31 06:13:50.751');
/*!40000 ALTER TABLE `resource_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `role_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_role_name_key` (`role_name`),
  UNIQUE KEY `role_role_code_key` (`role_code`),
  KEY `role_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'PLATFORM_ADMIN','ผู้ดูแลแพลตฟอร์มทั้งหมด','2026-08-02 08:32:38.914','PLATFORM_ADMIN','ACTIVE','2026-09-02 15:36:14.347'),(2,'COMPANY_ADMIN','ผู้ดูแลบริษัทของตัวเอง','2026-08-02 08:32:38.914','COMPANY_ADMIN','ACTIVE','2026-09-02 15:36:14.387'),(3,'MANAGER','ผู้จัดการ ดูแดชบอร์ด วิเคราะห์ข้อมูล การแจ้งเตือน และรายงาน','2026-08-02 08:32:38.914','FACTORY_MANAGER','ACTIVE','2026-09-02 15:36:14.400'),(4,'OPERATOR','ผู้ปฏิบัติงาน บันทึกข้อมูลหน้างานและสแกน QR Code','2026-08-02 08:32:38.914','ENVIRONMENT_OFFICER','ACTIVE','2026-09-02 15:36:14.413');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permission`
--

DROP TABLE IF EXISTS `role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permission` (
  `role_permission_id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `permission_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NONE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`role_permission_id`),
  UNIQUE KEY `role_permission_role_id_permission_id_key` (`role_id`,`permission_id`),
  KEY `role_permission_role_id_idx` (`role_id`),
  KEY `role_permission_permission_id_idx` (`permission_id`),
  KEY `role_permission_permission_level_idx` (`permission_level`),
  CONSTRAINT `role_permission_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `role_permission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission`
--

LOCK TABLES `role_permission` WRITE;
/*!40000 ALTER TABLE `role_permission` DISABLE KEYS */;
INSERT INTO `role_permission` VALUES (1,2,1,'VIEW','2026-08-02 01:47:51.677','2026-08-02 02:44:46.883'),(2,2,2,'VIEW','2026-08-02 01:47:51.689','2026-08-02 02:44:46.891'),(3,2,3,'VIEW','2026-08-02 01:47:51.693','2026-08-02 02:44:46.901'),(4,2,4,'VIEW','2026-08-02 01:47:51.698','2026-08-02 02:44:46.909'),(5,2,5,'VIEW','2026-08-02 01:47:51.701','2026-08-02 02:44:46.918'),(6,2,6,'FULL','2026-08-02 01:47:51.706','2026-08-02 02:44:46.926'),(7,2,7,'FULL','2026-08-02 01:47:51.710','2026-08-02 02:44:46.941'),(8,2,8,'FULL','2026-08-02 01:47:51.718','2026-08-02 02:44:46.950'),(9,2,9,'NONE','2026-08-02 01:47:51.722','2026-08-02 02:44:46.959'),(10,2,10,'FULL','2026-08-02 01:47:51.726','2026-08-02 02:44:46.967'),(11,2,11,'FULL','2026-08-02 01:47:51.729','2026-08-02 02:44:46.974'),(12,2,12,'FULL','2026-08-02 01:47:51.733','2026-08-02 02:44:46.982'),(13,2,13,'FULL','2026-08-02 01:47:51.736','2026-08-02 02:44:46.990'),(14,2,14,'VIEW','2026-08-02 01:47:51.739','2026-08-02 02:44:46.998'),(15,2,15,'VIEW','2026-08-02 01:47:51.743','2026-08-02 02:44:47.006'),(16,2,16,'VIEW','2026-08-02 01:47:51.746','2026-08-02 02:44:47.015'),(17,2,17,'VIEW','2026-08-02 01:47:51.749','2026-08-02 02:44:47.023'),(18,2,18,'VIEW','2026-08-02 01:47:51.753','2026-08-02 02:44:47.032'),(19,2,19,'VIEW','2026-08-02 01:47:51.763','2026-08-02 02:44:47.040'),(20,2,20,'VIEW','2026-08-02 01:47:51.766','2026-08-02 02:44:47.055'),(21,2,21,'NONE','2026-08-02 01:47:51.769','2026-08-02 02:44:47.064'),(22,2,22,'NONE','2026-08-02 01:47:51.773','2026-08-02 02:44:47.071'),(23,2,23,'NONE','2026-08-02 01:47:51.777','2026-08-02 02:44:47.078'),(24,2,24,'NONE','2026-08-02 01:47:51.780','2026-08-02 02:44:47.086'),(25,4,1,'VIEW','2026-08-02 01:47:51.783','2026-08-02 02:44:46.887'),(26,4,2,'FULL','2026-08-02 01:47:51.786','2026-08-02 02:44:46.896'),(27,4,3,'VIEW','2026-08-02 01:47:51.790','2026-08-02 02:44:46.905'),(28,4,4,'VIEW','2026-08-02 01:47:51.793','2026-08-02 02:44:46.914'),(29,4,5,'VIEW','2026-08-02 01:47:51.796','2026-08-02 02:44:46.922'),(30,4,6,'FULL','2026-08-02 01:47:51.798','2026-08-02 02:44:46.936'),(31,4,7,'NONE','2026-08-02 01:47:51.801','2026-08-02 02:44:46.945'),(32,4,8,'NONE','2026-08-02 01:47:51.804','2026-08-02 02:44:46.955'),(33,4,9,'NONE','2026-08-02 01:47:51.808','2026-08-02 02:44:46.963'),(34,4,10,'VIEW','2026-08-02 01:47:51.810','2026-08-02 02:44:46.971'),(35,4,11,'VIEW','2026-08-02 01:47:51.813','2026-08-02 02:44:46.977'),(36,4,12,'VIEW','2026-08-02 01:47:51.816','2026-08-02 02:44:46.986'),(37,4,13,'VIEW','2026-08-02 01:47:51.818','2026-08-02 02:44:46.994'),(38,4,14,'VIEW','2026-08-02 01:47:51.821','2026-08-02 02:44:47.002'),(39,4,15,'VIEW','2026-08-02 01:47:51.824','2026-08-02 02:44:47.010'),(40,4,16,'VIEW','2026-08-02 01:47:51.827','2026-08-02 02:44:47.019'),(41,4,17,'VIEW','2026-08-02 01:47:51.830','2026-08-02 02:44:47.027'),(42,4,18,'FULL','2026-08-02 01:47:51.833','2026-08-02 02:44:47.036'),(43,4,19,'VIEW','2026-08-02 01:47:51.837','2026-08-02 02:44:47.045'),(44,4,20,'FULL','2026-08-02 01:47:51.840','2026-08-02 02:44:47.059'),(45,4,21,'NONE','2026-08-02 01:47:51.844','2026-08-02 02:44:47.068'),(46,4,22,'NONE','2026-08-02 01:47:51.847','2026-08-02 02:44:47.074'),(47,4,23,'NONE','2026-08-02 01:47:51.850','2026-08-02 02:44:47.082'),(48,4,24,'NONE','2026-08-02 01:47:51.853','2026-08-02 02:44:47.091'),(49,3,1,'VIEW','2026-08-02 01:47:51.857','2026-08-02 02:44:46.885'),(50,3,2,'VIEW','2026-08-02 01:47:51.860','2026-08-02 02:44:46.894'),(51,3,3,'VIEW','2026-08-02 01:47:51.862','2026-08-02 02:44:46.903'),(52,3,4,'FULL','2026-08-02 01:47:51.865','2026-08-02 02:44:46.911'),(53,3,5,'VIEW','2026-08-02 01:47:51.869','2026-08-02 02:44:46.920'),(54,3,6,'FULL','2026-08-02 01:47:51.873','2026-08-02 02:44:46.928'),(55,3,7,'NONE','2026-08-02 01:47:51.876','2026-08-02 02:44:46.943'),(56,3,8,'NONE','2026-08-02 01:47:51.879','2026-08-02 02:44:46.952'),(57,3,9,'NONE','2026-08-02 01:47:51.882','2026-08-02 02:44:46.961'),(58,3,10,'FULL','2026-08-02 01:47:51.885','2026-08-02 02:44:46.969'),(59,3,11,'FULL','2026-08-02 01:47:51.888','2026-08-02 02:44:46.976'),(60,3,12,'FULL','2026-08-02 01:47:51.891','2026-08-02 02:44:46.984'),(61,3,13,'FULL','2026-08-02 01:47:51.893','2026-08-02 02:44:46.992'),(62,3,14,'FULL','2026-08-02 01:47:51.896','2026-08-02 02:44:47.000'),(63,3,15,'FULL','2026-08-02 01:47:51.900','2026-08-02 02:44:47.008'),(64,3,16,'FULL','2026-08-02 01:47:51.902','2026-08-02 02:44:47.017'),(65,3,17,'FULL','2026-08-02 01:47:51.906','2026-08-02 02:44:47.025'),(66,3,18,'FULL','2026-08-02 01:47:51.910','2026-08-02 02:44:47.034'),(67,3,19,'VIEW','2026-08-02 01:47:51.913','2026-08-02 02:44:47.043'),(68,3,20,'VIEW','2026-08-02 01:47:51.916','2026-08-02 02:44:47.057'),(69,3,21,'NONE','2026-08-02 01:47:51.919','2026-08-02 02:44:47.066'),(70,3,22,'NONE','2026-08-02 01:47:51.922','2026-08-02 02:44:47.073'),(71,3,23,'NONE','2026-08-02 01:47:51.925','2026-08-02 02:44:47.081'),(72,3,24,'NONE','2026-08-02 01:47:51.928','2026-08-02 02:44:47.088'),(73,1,1,'FULL','2026-08-02 01:47:51.931','2026-08-02 02:44:46.880'),(74,1,2,'FULL','2026-08-02 01:47:51.934','2026-08-02 02:44:46.889'),(75,1,3,'FULL','2026-08-02 01:47:51.937','2026-08-02 02:44:46.898'),(76,1,4,'FULL','2026-08-02 01:47:51.940','2026-08-02 02:44:46.907'),(77,1,5,'FULL','2026-08-02 01:47:51.943','2026-08-02 02:44:46.916'),(78,1,6,'FULL','2026-08-02 01:47:51.946','2026-08-02 02:44:46.924'),(79,1,7,'FULL','2026-08-02 01:47:51.949','2026-08-02 02:44:46.938'),(80,1,8,'FULL','2026-08-02 01:47:51.952','2026-08-02 02:44:46.948'),(81,1,9,'FULL','2026-08-02 01:47:51.954','2026-08-02 02:44:46.957'),(82,1,10,'FULL','2026-08-02 01:47:51.958','2026-08-02 02:44:46.965'),(83,1,11,'FULL','2026-08-02 01:47:51.961','2026-08-02 02:44:46.972'),(84,1,12,'FULL','2026-08-02 01:47:51.964','2026-08-02 02:44:46.980'),(85,1,13,'FULL','2026-08-02 01:47:51.967','2026-08-02 02:44:46.988'),(86,1,14,'FULL','2026-08-02 01:47:51.971','2026-08-02 02:44:46.996'),(87,1,15,'FULL','2026-08-02 01:47:51.975','2026-08-02 02:44:47.004'),(88,1,16,'FULL','2026-08-02 01:47:51.978','2026-08-02 02:44:47.012'),(89,1,17,'FULL','2026-08-02 01:47:51.981','2026-08-02 02:44:47.021'),(90,1,18,'FULL','2026-08-02 01:47:51.984','2026-08-02 02:44:47.029'),(91,1,19,'FULL','2026-08-02 01:47:51.986','2026-08-02 02:44:47.038'),(92,1,20,'FULL','2026-08-02 01:47:51.989','2026-08-02 02:44:47.052'),(93,1,21,'FULL','2026-08-02 01:47:51.992','2026-08-02 02:44:47.061'),(94,1,22,'FULL','2026-08-02 01:47:51.995','2026-08-02 02:44:47.070'),(95,1,23,'FULL','2026-08-02 01:47:51.998','2026-08-02 02:44:47.076'),(96,1,24,'FULL','2026-08-02 01:47:52.001','2026-08-02 02:44:47.085');
/*!40000 ALTER TABLE `role_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sensor`
--

DROP TABLE IF EXISTS `sensor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sensor` (
  `sensor_id` int NOT NULL AUTO_INCREMENT,
  `machine_id` int NOT NULL,
  `sensor_type_id` int NOT NULL,
  `sensor_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sensor_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `serial_number` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manufacturer` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `protocol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `connection_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_topic` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sampling_interval_seconds` int DEFAULT NULL,
  `last_connected_at` datetime(3) DEFAULT NULL,
  `installation_date` date DEFAULT NULL,
  `last_calibration_date` date DEFAULT NULL,
  `next_calibration_date` date DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`sensor_id`),
  UNIQUE KEY `sensor_machine_id_sensor_code_key` (`machine_id`,`sensor_code`),
  KEY `sensor_machine_id_idx` (`machine_id`),
  KEY `sensor_sensor_type_id_idx` (`sensor_type_id`),
  KEY `sensor_status_idx` (`status`),
  KEY `sensor_last_connected_at_idx` (`last_connected_at`),
  KEY `sensor_sensor_name_idx` (`sensor_name`),
  CONSTRAINT `sensor_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine` (`machine_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `sensor_sensor_type_id_fkey` FOREIGN KEY (`sensor_type_id`) REFERENCES `sensor_type` (`sensor_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sensor`
--

LOCK TABLES `sensor` WRITE;
/*!40000 ALTER TABLE `sensor` DISABLE KEYS */;
INSERT INTO `sensor` VALUES (1,1,4,'SEN-0001','Power Meter SMT-01',NULL,NULL,'Modbus TCP','192.168.1.100:502','factory/smt/machine01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-19 09:16:25.462','2026-08-19 09:16:25.462'),(2,2,2,'4444','444','444','lkkkl','Modbus TCP',NULL,NULL,60,NULL,'2026-08-20','2026-08-20','2026-08-20','ACTIVE','2026-08-21 02:53:58.103','2026-08-21 02:53:58.103'),(3,18,1,'SEN-0010','Temperature Sensor Burn-In T1-01','E5CC-T1002','Omron','Modbus TCP','192.168.1.110:502','factory/test/t1/burnin01/temperature',30,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 16:28:01.574','2026-08-28 16:28:01.574'),(4,3,6,'MC-A1-001','Pressure Sensor Dispensing A1-01','GF-SEN-PRS-001','GF-SEN-PRS-001','Modbus TCP','192.168.1.101:502','factory/a1/dispensing01/pressure',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:28:55.921','2026-08-28 17:28:55.921'),(5,5,6,'SEN-0002','Pressure Sensor Dispensing A2-01','GF-SEN-PRS-002','SMC','Modbus RTU','COM3 / 9600 / ID:2','factory/a2/dispensing01/pressure',30,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:30:38.233','2026-08-28 17:30:38.233'),(6,8,4,'SEN-0003','Power Meter SPI B1-01','GF-SEN-PWR-003','Schneider Electric','Modbus TCP','192.168.1.103:502','factory/b1/spi01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:33:30.403','2026-08-28 17:33:30.403'),(7,9,6,'SEN-0004','Power Meter AOI B2-01','GF-SEN-PWR-004','Schneider Electric','Modbus TCP','192.168.1.104:502','factory/b2/aoi01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:34:37.012','2026-08-28 17:34:37.012'),(8,28,4,'SEN-0005','Power Meter AOI Q1-01','GF-SEN-PWR-005','Siemens','OPC UA','opc.tcp://192.168.2.101:4840','2.101:4840 factory/q1/aoi01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:35:49.832','2026-08-28 17:35:49.832'),(9,28,4,'SEN-0004','Power Meter AOI B2-01','GF-SEN-PWR-004','Schneider Electric','Modbus TCP','192.168.1.104:502','factory/b2/aoi01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:37:31.504','2026-08-28 17:37:31.504'),(10,14,3,'SEN-0006','Energy Meter X-Ray C3-01','GF-SEN-ENG-006','Schneider Electric','Modbus TCP','192.168.1.106:502','factory/c3/xray01/energy',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:38:45.196','2026-08-28 17:38:45.196'),(11,29,3,'SEN-0007','Energy Meter X-Ray Q2-01','GF-SEN-ENG-007','Siemens','OPC UA','opc.tcp://192.168.2.102:4840','factory/q2/xray01/energy',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:40:16.520','2026-08-28 17:40:16.520'),(12,15,3,'SEN-0008','Energy Meter X-Ray QA1-01','QA1-01 GF-SEN-ENG-008','Schneider Electric','Modbus TCP','192.168.1.108:502','factory/qa1/xray01/energy',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:41:46.844','2026-08-28 17:41:46.844'),(13,31,4,'SEN-0009','Power Meter Functional Test T1-01','GF-SEN-PWR-009','National Instruments','HTTP API','192.168.2.103:8080','factory/t1/functional02/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:42:50.989','2026-08-28 17:42:50.989'),(14,17,4,'SEN-0010','Power Meter Functional Test T1-01','GF-SEN-PWR-010','National Instruments','HTTP API','192.168.1.110:8080','factory/t1/functional01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:44:05.391','2026-08-28 17:44:05.391'),(15,16,8,'SEN-0011','Current Sensor ICT QA2-01','GF-SEN-CUR-011','Omron','Modbus RTU','COM4 / 9600 / ID:11','factory/qa2/ict01/current',30,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:45:17.177','2026-08-28 17:46:01.802'),(16,30,8,'SEN-0012','Current Sensor ICT T1-01','GF-SEN-CUR-012','Omron','Modbus RTU','COM4 / 9600 / ID:12','factory/t1/ict01/current',30,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:48:12.075','2026-08-28 17:48:12.075'),(17,7,5,'SEN-0013','Water Flow Meter PCB Cleaning A3-01','GF-SEN-FLW-013','Endress+Hauser','Modbus TCP','192.168.1.113:502','factory/a3/pcbclean01/flow',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:49:56.649','2026-08-28 17:49:56.649'),(18,12,1,'SEN-0014','Temperature Sensor Soldering A3-01','GF-SEN-TMP-014','Omron','Modbus RTU','COM5 / 9600 / ID:14','factory/a3/solder01/temperature',15,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:51:29.613','2026-08-28 17:51:29.613'),(19,12,1,'SEN-0015','Temperature Sensor Wave C1-01','GF-SEN-TMP-015','Omron','Modbus TCP','192.168.1.115:502','factory/c1/wavesolder01/temperature',15,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:52:51.565','2026-08-28 17:52:51.565'),(20,24,6,'SEN-0016','Pressure Sensor Printer A1-01','GF-SEN-PRS-016','SMC','Modbus RTU','COM5 / 9600 / ID:16','factory/a1/printer01/pressure',30,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:54:28.300','2026-08-28 17:54:28.300'),(21,6,4,'SEN-0017','Power Meter Laser A2-01','GF-SEN-PWR-017','PWR-017 Schneider Electric','Modbus TCP','192.168.1.117:502','factory/a2/laser01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:55:35.925','2026-08-28 17:55:35.925'),(22,27,4,'SEN-0018','Power Meter Laser A3-01','GF-SEN-PWR-018','Schneider Electric','Modbus TCP','192.168.2.107:502','factory/a3/laser01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:56:59.389','2026-08-28 17:56:59.389'),(23,13,4,'SEN-0019','Power Meter Laser C2-01','GF-SEN-PWR-019','Schneider Electric','Modbus TCP','192.168.1.119:502','factory/c2/laser01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:58:05.988','2026-08-28 17:58:05.988'),(24,19,4,'SEN-0020','Power Meter Laser P1-01','GF-SEN-PWR-020','Schneider Electric','MQTT','mqtt://192.168.1.20:1883','factory/p1/laser01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 17:59:56.836','2026-08-28 17:59:56.836'),(25,19,4,'SEN-0021','Power Meter Laser P2-01','GF-SEN-PWR-021','Schneider Electric','MQTT','mqtt://192.168.1.21:1883','factory/p2/laser01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 18:02:03.775','2026-08-28 18:02:03.775'),(26,22,4,'SEN-0022','Power Meter Laser W2-01','GF-SEN-PWR-022','Schneider Electric','MQTT','mqtt://192.168.1.22:1883','factory/w2/laser01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 18:03:37.565','2026-08-28 18:03:37.565'),(27,33,4,'SEN-0023','Power Meter Shipping Laser W2-01','GF-SEN-PWR-023','Schneider Electric','MQTT','mqtt://192.168.2.23:1883','factory/w2/shippinglaser01/power',60,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 18:04:41.118','2026-08-28 18:04:41.118'),(28,25,7,'SEN-0024','Vibration Sensor Pick Place A2-01','GF-SEN-VIB-024','ifm electronic','MQTT','mqtt://192.168.2.24:1883','factory/a2/pickplace01/vibration',10,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 18:05:51.596','2026-08-28 18:05:51.596'),(29,10,7,'SEN-0025','Vibration Sensor SMT B3-01','GF-SEN-VIB-025','ifm electronic','MQTT','mqtt://192.168.1.25:1883','factory/b3/smt01/vibration',10,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 18:09:51.677','2026-08-28 18:09:51.677'),(30,21,9,'SEN-0026','Voltage Sensor UPS P3-01','GF-SEN-VLT-026','Schneider Electric','Modbus TCP','192.168.1.126:502','factory/p3/ups01/voltage',30,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 18:11:11.116','2026-08-28 18:11:11.116'),(31,11,1,'SEN-0027','Temperature Sensor Reflow B3-01','GF-SEN-TMP-027','Omron','OPC UA','opc.tcp://192.168.1.127:4840','factory/b3/reflow01/temperature',15,NULL,NULL,NULL,NULL,'ACTIVE','2026-08-28 18:12:10.895','2026-08-28 18:12:10.895');
/*!40000 ALTER TABLE `sensor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sensor_data`
--

DROP TABLE IF EXISTS `sensor_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sensor_data` (
  `sensor_data_id` bigint NOT NULL AUTO_INCREMENT,
  `sensor_id` int NOT NULL,
  `unit_id` int NOT NULL,
  `raw_value` decimal(18,6) NOT NULL,
  `processed_value` decimal(18,6) DEFAULT NULL,
  `quality_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VALID',
  `measured_at` datetime(3) NOT NULL,
  `received_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`sensor_data_id`),
  KEY `sensor_data_sensor_id_measured_at_idx` (`sensor_id`,`measured_at`),
  KEY `sensor_data_unit_id_idx` (`unit_id`),
  KEY `sensor_data_quality_status_idx` (`quality_status`),
  KEY `sensor_data_measured_at_idx` (`measured_at`),
  CONSTRAINT `sensor_data_sensor_id_fkey` FOREIGN KEY (`sensor_id`) REFERENCES `sensor` (`sensor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `sensor_data_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sensor_data`
--

LOCK TABLES `sensor_data` WRITE;
/*!40000 ALTER TABLE `sensor_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `sensor_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sensor_type`
--

DROP TABLE IF EXISTS `sensor_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sensor_type` (
  `sensor_type_id` int NOT NULL AUTO_INCREMENT,
  `sensor_type_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sensor_type_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`sensor_type_id`),
  UNIQUE KEY `sensor_type_sensor_type_code_key` (`sensor_type_code`),
  KEY `sensor_type_status_idx` (`status`),
  KEY `sensor_type_sensor_type_name_idx` (`sensor_type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sensor_type`
--

LOCK TABLES `sensor_type` WRITE;
/*!40000 ALTER TABLE `sensor_type` DISABLE KEYS */;
INSERT INTO `sensor_type` VALUES (1,'TEMPERATURE','Temperature Sensor','ตรวจวัดอุณหภูมิของเครื่องจักรและกระบวนการผลิต','ACTIVE','2026-07-29 20:08:01.170','2026-08-01 20:19:27.453'),(2,'HUMIDITY','Humidity Sensor','ตรวจวัดความชื้นในพื้นที่ผลิตหรือพื้นที่ควบคุม','ACTIVE','2026-07-30 21:14:11.450','2026-08-01 20:19:27.460'),(3,'ENERGY_METER','Energy Meter','ตรวจวัดพลังงานไฟฟ้าที่ใช้จริง','ACTIVE','2026-07-30 21:14:11.456','2026-08-01 20:19:27.467'),(4,'POWER_METER','Power Meter','ตรวจวัดกำลังไฟฟ้าแบบเรียลไทม์','ACTIVE','2026-07-30 21:14:11.465','2026-08-01 20:19:27.474'),(5,'FLOW_METER','Flow Meter','ตรวจวัดอัตราการไหลของน้ำ ก๊าซ หรือลม','ACTIVE','2026-07-30 21:14:11.472','2026-08-01 20:19:27.480'),(6,'PRESSURE','Pressure Sensor','ตรวจวัดแรงดันของระบบลม ของเหลว หรือก๊าซ','ACTIVE','2026-07-30 21:14:11.478','2026-08-01 20:19:27.486'),(7,'VIBRATION','Vibration Sensor','ตรวจวัดแรงสั่นสะเทือนเพื่อเฝ้าระวังสภาพเครื่องจักร','ACTIVE','2026-07-30 21:14:11.484','2026-08-01 20:19:27.493'),(8,'CURRENT','Current Sensor','ตรวจวัดกระแสไฟฟ้าของเครื่องจักรหรือวงจร','ACTIVE','2026-07-30 21:14:11.490','2026-08-01 20:19:27.502'),(9,'VOLTAGE','Voltage Sensor','ตรวจวัดแรงดันไฟฟ้าของระบบ','ACTIVE','2026-07-30 21:14:11.497','2026-08-01 20:19:27.509'),(10,'PH','pH Sensor','ตรวจวัดค่าความเป็นกรด-ด่างของน้ำและน้ำเสีย','ACTIVE','2026-08-01 20:19:27.515','2026-08-01 20:19:27.515'),(11,'CONDUCTIVITY','Conductivity Sensor','ตรวจวัดค่าการนำไฟฟ้าของน้ำ DI, RO และน้ำในกระบวนการ','ACTIVE','2026-08-01 20:19:27.522','2026-08-01 20:19:27.522'),(12,'TURBIDITY','Turbidity Sensor','ตรวจวัดความขุ่นของน้ำหรือน้ำเสีย','ACTIVE','2026-08-01 20:19:27.528','2026-08-01 20:19:27.528'),(13,'DISSOLVED_OXYGEN','Dissolved Oxygen Sensor','ตรวจวัดออกซิเจนละลายในระบบน้ำและระบบบำบัดน้ำเสีย','ACTIVE','2026-08-01 20:19:27.534','2026-08-01 20:19:27.534'),(14,'WATER_LEVEL','Water Level Sensor','ตรวจวัดระดับน้ำในถัง ระบบผลิตน้ำ และระบบบำบัดน้ำเสีย','ACTIVE','2026-08-01 20:19:27.540','2026-08-01 20:19:27.540'),(15,'AIR_QUALITY','Air Quality Sensor','ตรวจวัดคุณภาพอากาศในพื้นที่ผลิตและพื้นที่สนับสนุน','ACTIVE','2026-08-01 20:19:27.545','2026-08-01 20:19:27.545'),(16,'PARTICLE','Particle Sensor','ตรวจวัดอนุภาคในพื้นที่ควบคุมหรือ Cleanroom','ACTIVE','2026-08-01 20:19:27.552','2026-08-01 20:19:27.552');
/*!40000 ALTER TABLE `sensor_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_tickets` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `ticket_reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reporter_id` int NOT NULL,
  `company_id` int DEFAULT NULL,
  `subject` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `page_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`ticket_id`),
  UNIQUE KEY `support_tickets_ticket_reference_key` (`ticket_reference`),
  KEY `support_tickets_reporter_id_idx` (`reporter_id`),
  KEY `support_tickets_company_id_idx` (`company_id`),
  KEY `support_tickets_status_idx` (`status`),
  KEY `support_tickets_created_at_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_tickets`
--

LOCK TABLES `support_tickets` WRITE;
/*!40000 ALTER TABLE `support_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_setting`
--

DROP TABLE IF EXISTS `system_setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_setting` (
  `system_setting_id` int NOT NULL AUTO_INCREMENT,
  `maintenance_mode` tinyint(1) NOT NULL DEFAULT '0',
  `force_mfa` tinyint(1) NOT NULL DEFAULT '0',
  `ip_protection` tinyint(1) NOT NULL DEFAULT '1',
  `anomaly_detection` tinyint(1) NOT NULL DEFAULT '1',
  `auto_block` tinyint(1) NOT NULL DEFAULT '1',
  `session_timeout_minutes` int NOT NULL DEFAULT '60',
  `max_login_attempts` int NOT NULL DEFAULT '5',
  `audit_retention_days` int NOT NULL DEFAULT '365',
  `login_retention_days` int NOT NULL DEFAULT '180',
  `backup_frequency` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DAILY',
  `carbon_analytics_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `sensor_monitoring_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `ai_recommendations_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `machine_qr_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `report_builder_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `updated_by` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`system_setting_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_setting`
--

LOCK TABLES `system_setting` WRITE;
/*!40000 ALTER TABLE `system_setting` DISABLE KEYS */;
INSERT INTO `system_setting` VALUES (1,0,0,1,1,1,60,5,365,180,'DAILY',1,1,0,1,0,NULL,'2026-08-17 05:51:59.124','2026-08-17 05:51:59.124');
/*!40000 ALTER TABLE `system_setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit`
--

DROP TABLE IF EXISTS `unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit` (
  `unit_id` int NOT NULL AUTO_INCREMENT,
  `unit_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbol` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`unit_id`),
  UNIQUE KEY `unit_unit_code_key` (`unit_code`),
  KEY `unit_status_idx` (`status`),
  KEY `unit_unit_type_idx` (`unit_type`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit`
--

LOCK TABLES `unit` WRITE;
/*!40000 ALTER TABLE `unit` DISABLE KEYS */;
INSERT INTO `unit` VALUES (1,'KWH','Kilowatt-hour','kWh','Energy','ACTIVE','2026-07-30 20:40:06.418','2026-08-01 20:19:26.723'),(2,'MWH','Megawatt-hour','MWh','Energy','ACTIVE','2026-07-30 21:14:11.195','2026-08-01 20:19:26.734'),(3,'KW','Kilowatt','kW','Power','ACTIVE','2026-07-30 21:14:11.202','2026-08-01 20:19:26.742'),(4,'LITER','Litre','L','Volume','ACTIVE','2026-07-30 21:14:11.210','2026-08-01 20:19:26.750'),(5,'M3','Cubic metre','m³','Volume','ACTIVE','2026-07-30 21:14:11.217','2026-08-01 20:19:26.757'),(6,'KG','Kilogram','kg','Mass','ACTIVE','2026-07-30 21:14:11.224','2026-08-01 20:19:26.764'),(7,'TONNE','Metric tonne','t','Mass','ACTIVE','2026-07-30 21:14:11.230','2026-08-01 20:19:26.778'),(8,'CELSIUS','Degree Celsius','°C','Temperature','ACTIVE','2026-07-30 21:14:11.242','2026-08-01 20:19:26.785'),(9,'BAR','Bar','bar','Pressure','ACTIVE','2026-07-30 21:14:11.248','2026-08-01 20:19:26.792'),(10,'PERCENT','Percent','%','Ratio','ACTIVE','2026-07-30 21:14:11.254','2026-08-01 20:19:26.799'),(11,'PCS','Piece','pcs','Count','ACTIVE','2026-07-30 21:14:11.261','2026-08-01 20:19:26.806'),(12,'HOUR','Hour','h','Time','ACTIVE','2026-07-30 21:14:11.266','2026-08-01 20:19:26.814'),(13,'GRAM','Gram','g','Mass','ACTIVE','2026-08-01 20:19:26.771','2026-08-01 20:19:26.771'),(14,'PALLET','Pallet','pallet','Count','ACTIVE','2026-08-01 20:19:26.822','2026-08-01 20:19:26.822');
/*!40000 ALTER TABLE `unit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `company_id` int DEFAULT NULL,
  `role_id` int NOT NULL,
  `employee_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `locked_until` datetime(3) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','LOCKED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `department` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `production_line` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `factory_id` int DEFAULT NULL,
  `failed_login_count` int NOT NULL DEFAULT '0',
  `last_login_at` datetime(3) DEFAULT NULL,
  `password_changed_at` datetime(3) DEFAULT NULL,
  `password_expires_at` datetime(3) DEFAULT NULL,
  `profile_image_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_email_key` (`email`),
  UNIQUE KEY `user_username_key` (`username`),
  KEY `user_company_id_idx` (`company_id`),
  KEY `user_role_id_idx` (`role_id`),
  KEY `user_factory_id_idx` (`factory_id`),
  KEY `user_department_id_idx` (`department_id`),
  KEY `user_status_idx` (`status`),
  KEY `user_company_id_role_id_idx` (`company_id`,`role_id`),
  KEY `user_factory_id_role_id_idx` (`factory_id`,`role_id`),
  KEY `user_department_id_role_id_idx` (`department_id`,`role_id`),
  CONSTRAINT `user_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_factory_id_fkey` FOREIGN KEY (`factory_id`) REFERENCES `factory` (`factory_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,NULL,1,NULL,'Platform','Administrator','admin@greenfactory.local','platformadmin','$2b$12$9H.jM9nJMG9E4BeZrh9z8uI3Hnday.j2/23cJWt0I/xlIH7DzqL06',NULL,NULL,'ACTIVE','2026-07-14 20:12:43.316','2026-09-02 15:36:15.064',NULL,NULL,NULL,NULL,0,'2026-08-16 19:48:15.260',NULL,NULL,NULL),(2,1,2,'GF-CA-001','ศิริพร','วัฒนกุล','admin@gf.com','gf.siriporn.admin','$2b$12$BXvfv449t/9vZCkI4uq9xu1FESmB8ujE4B7CG/S25jD63U3afchDa',NULL,NULL,'ACTIVE','2026-07-15 14:19:10.236','2026-09-02 15:36:15.789',NULL,NULL,NULL,NULL,0,'2026-08-30 17:04:51.748',NULL,NULL,NULL),(3,1,4,'GF-OP-001','กานต์พิชชา','นาคทอง','operator@gf.com','gf.kanpitcha.operator','$2b$12$D8v/Ovx23rMPpP2FkRLmB.w.huvLQtBYVyt01ouUGFL33vBoOHnay',NULL,NULL,'ACTIVE','2026-07-24 07:51:37.657','2026-09-02 15:36:16.855',NULL,NULL,NULL,3,0,'2026-08-30 17:10:54.997',NULL,NULL,'/uploads/profiles/profile-3-772b858c-445f-459d-a6e3-99438a2f961c.png'),(4,1,3,'GF-MGR-001','ธนกฤต','พิพัฒน์ชัย','manager@gf.com','gf.thanakrit.manager','$2b$12$l/PmuNDf6envByZqfruHtuvbjn23/rClqn7XYFYKXm6O5LXBlx/La',NULL,NULL,'ACTIVE','2026-07-28 17:56:46.658','2026-09-02 15:36:16.334',NULL,NULL,NULL,3,1,'2026-08-29 16:30:39.518',NULL,NULL,NULL),(5,2,2,'NEX-CA-001','ปวีณ์นุช','ศรีสวัสดิ์','admin@nextron.com','nex.paveenuch.admin','$2b$12$Gl5rJRKkHIMUOj.byYawresTbbGbBrRPYuxpsRPSZKkQrD/UL4kPO',NULL,NULL,'ACTIVE','2026-08-20 18:36:14.295','2026-09-02 15:36:17.321',NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(6,2,3,'NEX-MGR-001','อิทธิกร','ชัยภักดี','manager@nextron.com','nex.ittikorn.manager','$2b$12$ydanIsT7SPew2Fm15u2vOua80pZ7mFaCoQb19kiHm2LHVrRcsKpoy',NULL,NULL,'ACTIVE','2026-08-20 18:36:14.556','2026-09-02 15:36:17.803',NULL,NULL,NULL,1,0,NULL,NULL,NULL,NULL),(7,2,4,'NEX-OP-001','ณัฐชา','วงศ์ประเสริฐ','operator@nextron.com','nex.natcha.operator','$2b$12$tSoIfa78MT3DiEaaVNvb7uigULW4jykcK9Phw/vKheBwZb7pso6GC',NULL,NULL,'ACTIVE','2026-08-20 18:36:14.821','2026-09-02 15:36:18.279',NULL,NULL,NULL,1,0,NULL,NULL,NULL,NULL),(8,3,2,'VOLT-CA-001','ชญานิน','ภูวดล','admin@voltera.com','volt.chayanin.admin','$2b$12$ZICGlUCa7XnR2.C0akrXWuty9NrIpFHbXW7toZ6UFs5Ja/4CDdWjO',NULL,NULL,'ACTIVE','2026-08-20 18:36:15.084','2026-09-02 15:36:18.745',NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL),(9,3,3,'VOLT-MGR-001','พีรพัฒน์','เจริญกิจ','manager@voltera.com','volt.peerapat.manager','$2b$12$gyFLt7JkFqabrcXUYDl5TuvEErs7mUJEZVdy.HYr3Ol87CQykYfES',NULL,NULL,'ACTIVE','2026-08-20 18:36:15.348','2026-09-02 15:36:19.204',NULL,NULL,NULL,2,0,NULL,NULL,NULL,NULL),(10,3,4,'VOLT-OP-001','มนัสวี','แสงทอง','operator@voltera.com','volt.manaswee.operator','$2b$12$ESjUJfyec/bWlZsE.SpxHepoY9vD3rCB0DhwdCM9bjw3ORaxkobUO',NULL,NULL,'ACTIVE','2026-08-20 18:36:15.635','2026-09-02 15:36:19.675',NULL,NULL,NULL,2,0,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'greenfactory'
--

--
-- Dumping routines for database 'greenfactory'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-02 22:45:23
