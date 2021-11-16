CREATE TABLE `file_info` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cid` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'cid',
  `storage_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'crust storage key',
  `expired_at` bigint DEFAULT NULL COMMENT 'expired at',
  `calculated_at` bigint DEFAULT NULL COMMENT 'calculated at',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create time',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'update time',
  `access_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'access time',
  `source` int NOT NULL DEFAULT '0' COMMENT 'crust: 0, others: 1',
  `need_index` int NOT NULL DEFAULT '0' COMMENT '0: yes, 1: no',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_file_info_cid` (`cid`) USING BTREE COMMENT 'uniq cid',
  KEY `idx_file_info_need_index_access_time` (`need_index`,`access_time`,`source`) USING BTREE COMMENT 'idx update time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `peers_info` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `file_info_id` bigint NOT NULL COMMENT 'file info id',
  `gateway_id` bigint NOT NULL COMMENT 'gateway id',
  `peers_info` json DEFAULT NULL COMMENT 'peers info',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create time',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'update time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_file_list_id_gateway_id` (`file_info_id`,`gateway_id`) USING BTREE,
  KEY `fk_peers_info_gateway_id` (`gateway_id`),
  CONSTRAINT `fk_peers_info_file_info_id` FOREIGN KEY (`file_info_id`) REFERENCES `file_info` (`id`),
  CONSTRAINT `fk_peers_info_gateway_id` FOREIGN KEY (`gateway_id`) REFERENCES `gateway` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `base_config` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `base_key` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'base key',
  `base_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'base value',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create time',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'update time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_base_config_key` (`base_key`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
