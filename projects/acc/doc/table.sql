
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `nickname` nvarchar(50) NOT NULL COMMENT '用户昵称',
  `avatar_url` nvarchar(256) NOT NULL COMMENT '用户头像地址',
  `sign` nvarchar(256) COMMENT '用户签名/个人说明',
  `account` nvarchar(20) COMMENT '用户登录账户',
  `password` nvarchar(128) COMMENT '用户登录密码',
  `cert_id` bigint(20) COMMENT '用户实名信息',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  UNIQUE (`account`),
  INDEX(`account`, `password`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='用户表';


DROP TABLE IF EXISTS `users_verification`;
CREATE TABLE `users_verification` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `uid` bigint(20) unsigned NOT NULL COMMENT '关联 UID',
  `type` tinyint(3) unsigned NOT NULL COMMENT '0: 未知, 1: 手机号, 2: email',
  `target` nvarchar(50) NOT NULL COMMENT '用户设备账户: 手机号/邮箱',
  `extra` TEXT COMMENT '用户验证扩展信息',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  UNIQUE (`target`),
  INDEX(`target`, `type`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='用户验证信息表';

DROP TABLE IF EXISTS `users_authization`;
CREATE TABLE `users_authization` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `uid` bigint(20) unsigned NOT NULL COMMENT '关联 UID',
  `type` tinyint(3) unsigned NOT NULL COMMENT '0: 未知, 1: 微信小程序',
  `access_token` nvarchar(128) NOT NULL COMMENT '用户鉴权 token',
  `extra` TEXT COMMENT '用户鉴权扩展信息',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  UNIQUE INDEX (`access_token`, `type`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='用户鉴权信息表';

DROP TABLE IF EXISTS `users_certification`;
CREATE TABLE `users_certification` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `id_card` nvarchar(50) unsigned NOT NULL COMMENT '关联 UID',
  `real_name` nvarchar(8) unsigned NOT NULL COMMENT '0: 未知, 1: 微信小程序',
  `gender` nvarchar(128) NOT NULL COMMENT '用户鉴权 token',
  `extra` TEXT COMMENT '用户鉴权扩展信息',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  UNIQUE INDEX (`access_token`, `type`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='用户鉴权信息表';

-- users_certification
-- id, id_card, real_name, gender, brithday