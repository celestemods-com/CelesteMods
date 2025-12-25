-- CreateTable
CREATE TABLE `length` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NOT NULL,
    `description` VARCHAR(100) NOT NULL,
    `order` TINYINT UNSIGNED NOT NULL,

    UNIQUE INDEX `length_name_key`(`name`),
    UNIQUE INDEX `length_order_key`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `difficulty` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(100) NULL,
    `parentDifficultyId` SMALLINT UNSIGNED NULL DEFAULT 0,
    `order` TINYINT UNSIGNED NOT NULL,

    INDEX `difficulty_parentDifficultyId_idx`(`parentDifficultyId`),
    UNIQUE INDEX `difficulty_parentDifficultyId_name_key`(`parentDifficultyId`, `name`),
    UNIQUE INDEX `difficulty_parentDifficultyId_order_key`(`parentDifficultyId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tech` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(150) NULL,
    `difficultyId` SMALLINT UNSIGNED NOT NULL,

    UNIQUE INDEX `tech_name_key`(`name`),
    INDEX `tech_difficultyId_idx`(`difficultyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tech-video` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `url` VARCHAR(100) NOT NULL,

    INDEX `tech-video_techId_idx`(`techId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `publisher` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `gamebananaId` MEDIUMINT UNSIGNED NULL,
    `name` VARCHAR(100) NOT NULL,
    `userId` VARCHAR(191) NULL,

    UNIQUE INDEX `publisher_gamebananaId_key`(`gamebananaId`),
    UNIQUE INDEX `publisher_name_key`(`name`),
    INDEX `publisher_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `tag_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mod` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type` ENUM('Normal', 'Collab', 'Contest', 'LobbyOther') NOT NULL DEFAULT 'Normal',
    `name` VARCHAR(200) NOT NULL,
    `publisherId` SMALLINT UNSIGNED NOT NULL,
    `contentWarning` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(500) NULL,
    `shortDescription` VARCHAR(150) NOT NULL,
    `longDescription` VARCHAR(1500) NULL,
    `gamebananaModId` MEDIUMINT UNSIGNED NOT NULL,
    `timeSubmitted` INTEGER NOT NULL,
    `submittedBy` VARCHAR(191) NULL,
    `timeApproved` INTEGER NOT NULL,
    `approvedBy` VARCHAR(191) NULL,
    `timeCreatedGamebanana` INTEGER NOT NULL,

    UNIQUE INDEX `mod_gamebananaModId_key`(`gamebananaModId`),
    INDEX `mod_approvedBy_idx`(`approvedBy`),
    INDEX `mod_contentWarning_idx`(`contentWarning`),
    INDEX `mod_publisherId_idx`(`publisherId`),
    INDEX `mod_submittedBy_idx`(`submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mod-to-tags` (
    `modId` SMALLINT UNSIGNED NOT NULL,
    `tagId` TINYINT UNSIGNED NOT NULL,

    INDEX `mod-to-tags_tagId_idx`(`tagId`),
    PRIMARY KEY (`modId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `modId` SMALLINT UNSIGNED NOT NULL,
    `mapperUserId` VARCHAR(191) NULL,
    `mapperNameString` VARCHAR(50) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `canonicalDifficultyId` SMALLINT UNSIGNED NOT NULL,
    `lengthId` TINYINT UNSIGNED NOT NULL,
    `description` VARCHAR(500) NULL,
    `notes` VARCHAR(500) NULL,
    `chapter` TINYINT UNSIGNED NULL,
    `side` ENUM('A', 'B', 'C', 'D', 'E') NULL,
    `overallRank` TINYINT UNSIGNED NULL,
    `mapRemovedFromModBool` BOOLEAN NOT NULL DEFAULT false,
    `timeSubmitted` INTEGER NOT NULL,
    `submittedBy` VARCHAR(191) NULL,
    `timeApproved` INTEGER NOT NULL,
    `approvedBy` VARCHAR(191) NULL,

    INDEX `map_approvedBy_idx`(`approvedBy`),
    INDEX `map_canonicalDifficultyId_idx`(`canonicalDifficultyId`),
    INDEX `map_lengthId_idx`(`lengthId`),
    INDEX `map_mapperUserId_idx`(`mapperUserId`),
    INDEX `map_modId_idx`(`modId`),
    INDEX `map_submittedBy_idx`(`submittedBy`),
    UNIQUE INDEX `map_modId_chapter_side_key`(`modId`, `chapter`, `side`),
    UNIQUE INDEX `map_modId_name_key`(`modId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map-to-techs` (
    `mapId` MEDIUMINT UNSIGNED NOT NULL,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `fullClearOnlyBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `map-to-techs_techId_idx`(`techId`),
    PRIMARY KEY (`mapId`, `techId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mod-archive` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `modId` SMALLINT UNSIGNED NOT NULL,
    `type` ENUM('Normal', 'Collab', 'Contest', 'LobbyOther') NOT NULL DEFAULT 'Normal',
    `name` VARCHAR(200) NOT NULL,
    `publisherId` SMALLINT UNSIGNED NOT NULL,
    `contentWarning` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(500) NULL,
    `shortDescription` VARCHAR(150) NOT NULL,
    `longDescription` VARCHAR(1500) NULL,
    `gamebananaModId` MEDIUMINT UNSIGNED NOT NULL,
    `timeCreatedGamebanana` INTEGER NOT NULL,
    `timeSubmitted` INTEGER NOT NULL,
    `submittedBy` VARCHAR(191) NULL,
    `timeApproved` INTEGER NOT NULL,
    `approvedBy` VARCHAR(191) NULL,
    `timeArchived` INTEGER NOT NULL,

    INDEX `mod-archive_approvedBy_idx`(`approvedBy`),
    INDEX `mod-archive_contentWarning_idx`(`contentWarning`),
    INDEX `mod-archive_publisherId_idx`(`publisherId`),
    INDEX `mod-archive_submittedBy_idx`(`submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mod-archive-to-tags` (
    `mod_ArchiveId` SMALLINT UNSIGNED NOT NULL,
    `tagId` TINYINT UNSIGNED NOT NULL,

    INDEX `mod-archive-to-tags_tagId_idx`(`tagId`),
    PRIMARY KEY (`mod_ArchiveId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map-archive` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `mapId` MEDIUMINT UNSIGNED NOT NULL,
    `mapperUserId` VARCHAR(191) NULL,
    `mapperNameString` VARCHAR(50) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `canonicalDifficultyId` SMALLINT UNSIGNED NOT NULL,
    `lengthId` TINYINT UNSIGNED NOT NULL,
    `description` VARCHAR(500) NULL,
    `notes` VARCHAR(500) NULL,
    `chapter` TINYINT UNSIGNED NULL,
    `side` ENUM('A', 'B', 'C', 'D', 'E') NULL,
    `overallRank` TINYINT UNSIGNED NULL,
    `mapRemovedFromModBool` BOOLEAN NOT NULL DEFAULT false,
    `timeSubmitted` INTEGER NOT NULL,
    `submittedBy` VARCHAR(191) NULL,
    `timeApproved` INTEGER NOT NULL,
    `approvedBy` VARCHAR(191) NULL,
    `timeArchived` INTEGER NOT NULL,

    INDEX `map-archive_approvedBy_idx`(`approvedBy`),
    INDEX `map-archive_canonicalDifficultyId_idx`(`canonicalDifficultyId`),
    INDEX `map-archive_lengthId_idx`(`lengthId`),
    INDEX `map-archive_mapperUserId_idx`(`mapperUserId`),
    INDEX `map-archive_mapId_idx`(`mapId`),
    INDEX `map-archive_submittedBy_idx`(`submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mod-archive-to-techs` (
    `map_ArchiveId` MEDIUMINT UNSIGNED NOT NULL,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `fullClearOnlyBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `mod-archive-to-techs_techId_idx`(`techId`),
    PRIMARY KEY (`map_ArchiveId`, `techId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mod-edit` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `modId` SMALLINT UNSIGNED NOT NULL,
    `type` ENUM('Normal', 'Collab', 'Contest', 'LobbyOther') NOT NULL DEFAULT 'Normal',
    `name` VARCHAR(200) NOT NULL,
    `publisherId` SMALLINT UNSIGNED NOT NULL,
    `contentWarning` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(500) NULL,
    `shortDescription` VARCHAR(150) NOT NULL,
    `longDescription` VARCHAR(1500) NULL,
    `gamebananaModId` MEDIUMINT UNSIGNED NOT NULL,
    `timeCreatedGamebanana` INTEGER NOT NULL,
    `timeSubmitted` INTEGER NOT NULL,
    `submittedBy` VARCHAR(191) NULL,

    INDEX `mod-edit_contentWarning_idx`(`contentWarning`),
    INDEX `mod-edit_publisherId_idx`(`publisherId`),
    INDEX `mod-edit_submittedBy_idx`(`submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mod-edit-to-tags` (
    `mod_EditId` SMALLINT UNSIGNED NOT NULL,
    `tagId` TINYINT UNSIGNED NOT NULL,

    INDEX `mod-edit-to-tags_tagId_idx`(`tagId`),
    PRIMARY KEY (`mod_EditId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map-edit` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `mapId` MEDIUMINT UNSIGNED NOT NULL,
    `mapperUserId` VARCHAR(191) NULL,
    `mapperNameString` VARCHAR(50) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `canonicalDifficultyId` SMALLINT UNSIGNED NOT NULL,
    `lengthId` TINYINT UNSIGNED NOT NULL,
    `description` VARCHAR(500) NULL,
    `notes` VARCHAR(500) NULL,
    `chapter` TINYINT UNSIGNED NULL,
    `side` ENUM('A', 'B', 'C', 'D', 'E') NULL,
    `overallRank` TINYINT UNSIGNED NULL,
    `mapRemovedFromModBool` BOOLEAN NOT NULL DEFAULT false,
    `timeSubmitted` INTEGER NOT NULL,
    `submittedBy` VARCHAR(191) NULL,

    INDEX `map-edit_canonicalDifficultyId_idx`(`canonicalDifficultyId`),
    INDEX `map-edit_lengthId_idx`(`lengthId`),
    INDEX `map-edit_mapperUserId_idx`(`mapperUserId`),
    INDEX `map-edit_mapId_idx`(`mapId`),
    INDEX `map-edit_submittedBy_idx`(`submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map-edit-to-techs` (
    `map_editId` MEDIUMINT UNSIGNED NOT NULL,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `fullClearOnlyBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `map-edit-to-techs_techId_idx`(`techId`),
    PRIMARY KEY (`map_editId`, `techId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mod-new` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type` ENUM('Normal', 'Collab', 'Contest', 'LobbyOther') NOT NULL DEFAULT 'Normal',
    `name` VARCHAR(200) NOT NULL,
    `publisherId` SMALLINT UNSIGNED NOT NULL,
    `contentWarning` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(500) NULL,
    `shortDescription` VARCHAR(150) NOT NULL,
    `longDescription` VARCHAR(1500) NULL,
    `gamebananaModId` MEDIUMINT UNSIGNED NOT NULL,
    `timeSubmitted` INTEGER NOT NULL,
    `submittedBy` VARCHAR(191) NULL,
    `timeCreatedGamebanana` INTEGER NOT NULL,

    UNIQUE INDEX `mod-new_gamebananaModId_key`(`gamebananaModId`),
    INDEX `mod-new_contentWarning_idx`(`contentWarning`),
    INDEX `mod-new_publisherId_idx`(`publisherId`),
    INDEX `mod-new_submittedBy_idx`(`submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mod-new-to-tags` (
    `mod_NewId` SMALLINT UNSIGNED NOT NULL,
    `tagId` TINYINT UNSIGNED NOT NULL,

    INDEX `mod-new-to-tags_tagId_idx`(`tagId`),
    PRIMARY KEY (`mod_NewId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map-new-with-mod-new` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `mod_NewId` SMALLINT UNSIGNED NOT NULL,
    `mapperUserId` VARCHAR(191) NULL,
    `mapperNameString` VARCHAR(50) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `canonicalDifficultyId` SMALLINT UNSIGNED NOT NULL,
    `lengthId` TINYINT UNSIGNED NOT NULL,
    `description` VARCHAR(500) NULL,
    `notes` VARCHAR(500) NULL,
    `chapter` TINYINT UNSIGNED NULL,
    `side` ENUM('A', 'B', 'C', 'D', 'E') NULL,
    `overallRank` TINYINT UNSIGNED NULL,
    `mapRemovedFromModBool` BOOLEAN NOT NULL DEFAULT false,
    `timeSubmitted` INTEGER NOT NULL,
    `submittedBy` VARCHAR(191) NULL,

    INDEX `map-new-with-mod-new_canonicalDifficultyId_idx`(`canonicalDifficultyId`),
    INDEX `map-new-with-mod-new_lengthId_idx`(`lengthId`),
    INDEX `map-new-with-mod-new_mapperUserId_idx`(`mapperUserId`),
    INDEX `map-new-with-mod-new_mod_NewId_idx`(`mod_NewId`),
    INDEX `map-new-with-mod-new_submittedBy_idx`(`submittedBy`),
    UNIQUE INDEX `map-new-with-mod-new_mod_NewId_chapter_side_key`(`mod_NewId`, `chapter`, `side`),
    UNIQUE INDEX `map-new-with-mod-new_mod_NewId_name_key`(`mod_NewId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map-new-with-mod-new-to-techs` (
    `map_NewWithMod_NewId` MEDIUMINT UNSIGNED NOT NULL,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `fullClearOnlyBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `map-new-with-mod-new-to-techs_techId_idx`(`techId`),
    PRIMARY KEY (`map_NewWithMod_NewId`, `techId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map-new-solo` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `modId` SMALLINT UNSIGNED NOT NULL,
    `mapperUserId` VARCHAR(191) NULL,
    `mapperNameString` VARCHAR(50) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `canonicalDifficultyId` SMALLINT UNSIGNED NOT NULL,
    `lengthId` TINYINT UNSIGNED NOT NULL,
    `description` VARCHAR(500) NULL,
    `notes` VARCHAR(500) NULL,
    `chapter` TINYINT UNSIGNED NULL,
    `side` ENUM('A', 'B', 'C', 'D', 'E') NULL,
    `overallRank` TINYINT UNSIGNED NULL,
    `mapRemovedFromModBool` BOOLEAN NOT NULL DEFAULT false,
    `timeSubmitted` INTEGER NOT NULL,
    `submittedBy` VARCHAR(191) NULL,

    INDEX `map-new-solo_canonicalDifficultyId_idx`(`canonicalDifficultyId`),
    INDEX `map-new-solo_lengthId_idx`(`lengthId`),
    INDEX `map-new-solo_mapperUserId_idx`(`mapperUserId`),
    INDEX `map-new-solo_modId_idx`(`modId`),
    INDEX `map-new-solo_submittedBy_idx`(`submittedBy`),
    UNIQUE INDEX `map-new-solo_modId_chapter_side_key`(`modId`, `chapter`, `side`),
    UNIQUE INDEX `map-new-solo_modId_name_key`(`modId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map-new-solo-to-techs` (
    `map_NewSoloId` MEDIUMINT UNSIGNED NOT NULL,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `fullClearOnlyBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `map-new-solo-to-techs_techId_idx`(`techId`),
    PRIMARY KEY (`map_NewSoloId`, `techId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quality` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NOT NULL,
    `description` VARCHAR(100) NOT NULL,
    `order` TINYINT UNSIGNED NOT NULL,

    UNIQUE INDEX `quality_name_key`(`name`),
    UNIQUE INDEX `quality_order_key`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rating` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `mapId` MEDIUMINT UNSIGNED NOT NULL,
    `submittedBy` VARCHAR(191) NOT NULL,
    `timeSubmitted` INTEGER NOT NULL,
    `qualityId` TINYINT UNSIGNED NULL,
    `difficultyId` SMALLINT UNSIGNED NULL,

    INDEX `rating_difficultyId_idx`(`difficultyId`),
    INDEX `rating_mapId_idx`(`mapId`),
    INDEX `rating_qualityId_idx`(`qualityId`),
    INDEX `rating_submittedBy_idx`(`submittedBy`),
    UNIQUE INDEX `rating_mapId_submittedBy_key`(`mapId`, `submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review-collection` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NOT NULL,

    INDEX `review-collection_userId_idx`(`userId`),
    UNIQUE INDEX `review-collection_userId_name_key`(`userId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `modId` SMALLINT UNSIGNED NOT NULL,
    `reviewCollectionId` SMALLINT UNSIGNED NOT NULL,
    `timeSubmitted` INTEGER NOT NULL,
    `likes` VARCHAR(1000) NULL,
    `dislikes` VARCHAR(1000) NULL,
    `otherComments` VARCHAR(1500) NULL,

    INDEX `review_modId_idx`(`modId`),
    INDEX `review_reviewCollectionId_idx`(`reviewCollectionId`),
    UNIQUE INDEX `review_reviewCollectionId_modId_key`(`reviewCollectionId`, `modId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map-review` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `reviewId` MEDIUMINT UNSIGNED NOT NULL,
    `mapId` MEDIUMINT UNSIGNED NOT NULL,
    `lengthId` TINYINT UNSIGNED NOT NULL,
    `timeSubmitted` INTEGER NOT NULL,
    `likes` VARCHAR(500) NULL,
    `dislikes` VARCHAR(500) NULL,
    `otherComments` VARCHAR(500) NULL,
    `displayRatingBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `map-review_lengthId_idx`(`lengthId`),
    INDEX `map-review_mapId_idx`(`mapId`),
    INDEX `map-review_reviewId_idx`(`reviewId`),
    UNIQUE INDEX `map-review_reviewId_mapId_key`(`reviewId`, `mapId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users-to-completed-maps` (
    `userId` VARCHAR(191) NOT NULL,
    `mapId` MEDIUMINT UNSIGNED NOT NULL,

    INDEX `users-to-completed-maps_mapId_idx`(`mapId`),
    PRIMARY KEY (`userId`, `mapId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user-claim` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `claimedBy` VARCHAR(191) NOT NULL,
    `claimedUserId` VARCHAR(191) NOT NULL,
    `approvedBy` VARCHAR(191) NULL,

    INDEX `user-claim_claimedBy_idx`(`claimedBy`),
    UNIQUE INDEX `user-claim_claimedBy_claimedUserId_key`(`claimedBy`, `claimedUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `discordUsername` VARCHAR(32) NULL,
    `discordDiscriminator` VARCHAR(4) NULL,
    `displayDiscord` BOOLEAN NULL,
    `showCompletedMaps` BOOLEAN NOT NULL DEFAULT false,
    `permissions` VARCHAR(191) NOT NULL DEFAULT '',
    `accountStatus` ENUM('Active', 'Deleted', 'Banned', 'Unlinked') NOT NULL DEFAULT 'Active',
    `timeDeletedOrBanned` INTEGER NULL,

    UNIQUE INDEX `user_discordUsername_discordDiscriminator_key`(`discordUsername`, `discordDiscriminator`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refreshToken` TEXT NULL,
    `accessToken` TEXT NULL,
    `expiresAt` INTEGER NULL,
    `tokenType` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `idToken` TEXT NULL,
    `sessionState` VARCHAR(191) NULL,

    UNIQUE INDEX `account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification-token` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `verification-token_token_key`(`token`),
    UNIQUE INDEX `verification-token_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `difficulty` ADD CONSTRAINT `difficulty_parentDifficultyId_fkey` FOREIGN KEY (`parentDifficultyId`) REFERENCES `difficulty`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tech` ADD CONSTRAINT `tech_difficultyId_fkey` FOREIGN KEY (`difficultyId`) REFERENCES `difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tech-video` ADD CONSTRAINT `tech-video_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `publisher` ADD CONSTRAINT `publisher_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod` ADD CONSTRAINT `mod_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `publisher`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod` ADD CONSTRAINT `mod_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod` ADD CONSTRAINT `mod_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-to-tags` ADD CONSTRAINT `mod-to-tags_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `mod`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-to-tags` ADD CONSTRAINT `mod-to-tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map` ADD CONSTRAINT `map_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `mod`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map` ADD CONSTRAINT `map_mapperUserId_fkey` FOREIGN KEY (`mapperUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map` ADD CONSTRAINT `map_canonicalDifficultyId_fkey` FOREIGN KEY (`canonicalDifficultyId`) REFERENCES `difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map` ADD CONSTRAINT `map_lengthId_fkey` FOREIGN KEY (`lengthId`) REFERENCES `length`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map` ADD CONSTRAINT `map_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map` ADD CONSTRAINT `map_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-to-techs` ADD CONSTRAINT `map-to-techs_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-to-techs` ADD CONSTRAINT `map-to-techs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-archive` ADD CONSTRAINT `mod-archive_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `mod`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-archive` ADD CONSTRAINT `mod-archive_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `publisher`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-archive` ADD CONSTRAINT `mod-archive_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-archive` ADD CONSTRAINT `mod-archive_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-archive-to-tags` ADD CONSTRAINT `mod-archive-to-tags_mod_ArchiveId_fkey` FOREIGN KEY (`mod_ArchiveId`) REFERENCES `mod-archive`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-archive-to-tags` ADD CONSTRAINT `mod-archive-to-tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-archive` ADD CONSTRAINT `map-archive_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-archive` ADD CONSTRAINT `map-archive_mapperUserId_fkey` FOREIGN KEY (`mapperUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-archive` ADD CONSTRAINT `map-archive_canonicalDifficultyId_fkey` FOREIGN KEY (`canonicalDifficultyId`) REFERENCES `difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-archive` ADD CONSTRAINT `map-archive_lengthId_fkey` FOREIGN KEY (`lengthId`) REFERENCES `length`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-archive` ADD CONSTRAINT `map-archive_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-archive` ADD CONSTRAINT `map-archive_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-archive-to-techs` ADD CONSTRAINT `mod-archive-to-techs_map_ArchiveId_fkey` FOREIGN KEY (`map_ArchiveId`) REFERENCES `map-archive`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-archive-to-techs` ADD CONSTRAINT `mod-archive-to-techs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-edit` ADD CONSTRAINT `mod-edit_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `mod`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-edit` ADD CONSTRAINT `mod-edit_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `publisher`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-edit` ADD CONSTRAINT `mod-edit_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-edit-to-tags` ADD CONSTRAINT `mod-edit-to-tags_mod_EditId_fkey` FOREIGN KEY (`mod_EditId`) REFERENCES `mod-edit`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-edit-to-tags` ADD CONSTRAINT `mod-edit-to-tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-edit` ADD CONSTRAINT `map-edit_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-edit` ADD CONSTRAINT `map-edit_mapperUserId_fkey` FOREIGN KEY (`mapperUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-edit` ADD CONSTRAINT `map-edit_canonicalDifficultyId_fkey` FOREIGN KEY (`canonicalDifficultyId`) REFERENCES `difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-edit` ADD CONSTRAINT `map-edit_lengthId_fkey` FOREIGN KEY (`lengthId`) REFERENCES `length`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-edit` ADD CONSTRAINT `map-edit_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-edit-to-techs` ADD CONSTRAINT `map-edit-to-techs_map_editId_fkey` FOREIGN KEY (`map_editId`) REFERENCES `map-edit`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-edit-to-techs` ADD CONSTRAINT `map-edit-to-techs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-new` ADD CONSTRAINT `mod-new_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `publisher`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-new` ADD CONSTRAINT `mod-new_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-new-to-tags` ADD CONSTRAINT `mod-new-to-tags_mod_NewId_fkey` FOREIGN KEY (`mod_NewId`) REFERENCES `mod-edit`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-new-to-tags` ADD CONSTRAINT `mod-new-to-tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-with-mod-new` ADD CONSTRAINT `map-new-with-mod-new_mod_NewId_fkey` FOREIGN KEY (`mod_NewId`) REFERENCES `mod-new`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-with-mod-new` ADD CONSTRAINT `map-new-with-mod-new_mapperUserId_fkey` FOREIGN KEY (`mapperUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-with-mod-new` ADD CONSTRAINT `map-new-with-mod-new_canonicalDifficultyId_fkey` FOREIGN KEY (`canonicalDifficultyId`) REFERENCES `difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-with-mod-new` ADD CONSTRAINT `map-new-with-mod-new_lengthId_fkey` FOREIGN KEY (`lengthId`) REFERENCES `length`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-with-mod-new` ADD CONSTRAINT `map-new-with-mod-new_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-with-mod-new-to-techs` ADD CONSTRAINT `map-new-with-mod-new-to-techs_map_NewWithMod_NewId_fkey` FOREIGN KEY (`map_NewWithMod_NewId`) REFERENCES `map-new-with-mod-new`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-with-mod-new-to-techs` ADD CONSTRAINT `map-new-with-mod-new-to-techs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-solo` ADD CONSTRAINT `map-new-solo_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `mod`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-solo` ADD CONSTRAINT `map-new-solo_mapperUserId_fkey` FOREIGN KEY (`mapperUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-solo` ADD CONSTRAINT `map-new-solo_canonicalDifficultyId_fkey` FOREIGN KEY (`canonicalDifficultyId`) REFERENCES `difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-solo` ADD CONSTRAINT `map-new-solo_lengthId_fkey` FOREIGN KEY (`lengthId`) REFERENCES `length`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-solo` ADD CONSTRAINT `map-new-solo_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-solo-to-techs` ADD CONSTRAINT `map-new-solo-to-techs_map_NewSoloId_fkey` FOREIGN KEY (`map_NewSoloId`) REFERENCES `map-new-solo`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-new-solo-to-techs` ADD CONSTRAINT `map-new-solo-to-techs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_qualityId_fkey` FOREIGN KEY (`qualityId`) REFERENCES `quality`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_difficultyId_fkey` FOREIGN KEY (`difficultyId`) REFERENCES `difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `review-collection` ADD CONSTRAINT `review-collection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `mod`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_reviewCollectionId_fkey` FOREIGN KEY (`reviewCollectionId`) REFERENCES `review-collection`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-review` ADD CONSTRAINT `map-review_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `review`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-review` ADD CONSTRAINT `map-review_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-review` ADD CONSTRAINT `map-review_lengthId_fkey` FOREIGN KEY (`lengthId`) REFERENCES `length`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users-to-completed-maps` ADD CONSTRAINT `users-to-completed-maps_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users-to-completed-maps` ADD CONSTRAINT `users-to-completed-maps_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user-claim` ADD CONSTRAINT `user-claim_claimedBy_fkey` FOREIGN KEY (`claimedBy`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user-claim` ADD CONSTRAINT `user-claim_claimedUserId_fkey` FOREIGN KEY (`claimedUserId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user-claim` ADD CONSTRAINT `user-claim_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
