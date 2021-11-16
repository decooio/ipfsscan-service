ALTER TABLE `ipfs_scan`.`gateway`
ADD COLUMN `is_thunder` int NOT NULL DEFAULT 0 COMMENT 'no: 0, yes: 1' AFTER `update_time`;
