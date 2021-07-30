DROP TABLE IF EXISTS `common_data`;
CREATE TABLE `common_data` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` nvarchar(50) NOT NULL COMMENT '配置文件名称',
  `preview` text NOT NULL COMMENT '存储的文本的预览',
  `stable_url` nvarchar(256) NOT NULL COMMENT '文本文件的地址',
  `type` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '0: 未知, 1: json',
  `access` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '0: private, 1: public, 2: latest',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  UNIQUE INDEX(`name`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='通用数据表';

DROP TABLE IF EXISTS `users_data`;
CREATE TABLE `users_data` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `uid` bigint(20) unsigned NOT NULL COMMENT '用户 ID',
  `name` nvarchar(50) NOT NULL COMMENT '配置文件名称',
  `preview` text NOT NULL COMMENT '存储的文本的预览',
  `stable_url` nvarchar(256) NOT NULL COMMENT '文本文件的地址',
  `type` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '0: 未知, 1: json',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  UNIQUE INDEX(`name`, `uid`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='用户数据表';

DROP TABLE IF EXISTS `common_history`;
CREATE TABLE `common_history` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `rid` bigint(20) unsigned NOT NULL COMMENT 'Ref ID',
  `access` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '0: private, 1: public, 2: latest',
  `stable_url` nvarchar(256) NOT NULL COMMENT '文本文件的地址',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='通用数据历史表';

DROP TABLE IF EXISTS `users_history`;
CREATE TABLE `users_history` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `rid` bigint(20) unsigned NOT NULL COMMENT 'Ref ID',
  `stable_url` nvarchar(256) NOT NULL COMMENT '文本文件的地址',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='用户数据历史表';

