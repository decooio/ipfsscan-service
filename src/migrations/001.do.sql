CREATE TABLE `ipfs_scan`.`gateway`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL COMMENT 'gateway name',
  `baseUrl` varchar(255) NOT NULL COMMENT 'baseUrl (https://localhost:8080)',
  `deleted` int NOT NULL DEFAULT 0 COMMENT '1:deleted, 0:undeleted',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create time',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'update time',
  PRIMARY KEY (`id`),
  INDEX `idx_gateway_deleted`(`deleted`) USING BTREE
);
