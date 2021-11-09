ALTER TABLE `gateway`
ADD COLUMN `country` varchar(64) NULL COMMENT 'country' AFTER `baseUrl`,
ADD COLUMN `province` varchar(64) NULL COMMENT 'province' AFTER `country`,
ADD COLUMN `city` varchar(64) NULL COMMENT 'city' AFTER `province`,
ADD COLUMN `longitude` decimal(10, 7) NULL COMMENT 'longitude' AFTER `city`,
ADD COLUMN `latitude` decimal(10, 7) NULL COMMENT 'latitude' AFTER `longitude`;
