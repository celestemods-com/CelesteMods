-- CreateTable
CREATE TABLE `Length` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NOT NULL,
    `description` VARCHAR(100) NOT NULL,
    `order` TINYINT UNSIGNED NOT NULL,

    UNIQUE INDEX `Length_name_key`(`name`),
    UNIQUE INDEX `Length_order_key`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Difficulty` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(100) NULL,
    `parentDifficultyId` SMALLINT UNSIGNED NULL DEFAULT 0,
    `order` TINYINT UNSIGNED NOT NULL,

    INDEX `Difficulty_parentDifficultyId_idx`(`parentDifficultyId`),
    UNIQUE INDEX `Difficulty_parentDifficultyId_name_key`(`parentDifficultyId`, `name`),
    UNIQUE INDEX `Difficulty_parentDifficultyId_order_key`(`parentDifficultyId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tech` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(150) NULL,
    `difficultyId` SMALLINT UNSIGNED NOT NULL,

    UNIQUE INDEX `Tech_name_key`(`name`),
    INDEX `Tech_difficultyId_idx`(`difficultyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TechVideo` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `url` VARCHAR(100) NOT NULL,

    INDEX `TechVideo_techId_idx`(`techId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Publisher` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `gamebananaId` MEDIUMINT UNSIGNED NULL,
    `name` VARCHAR(100) NOT NULL,
    `userId` VARCHAR(191) NULL,

    UNIQUE INDEX `Publisher_gamebananaId_key`(`gamebananaId`),
    UNIQUE INDEX `Publisher_name_key`(`name`),
    INDEX `Publisher_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mod` (
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

    UNIQUE INDEX `Mod_gamebananaModId_key`(`gamebananaModId`),
    INDEX `Mod_approvedBy_idx`(`approvedBy`),
    INDEX `Mod_contentWarning_idx`(`contentWarning`),
    INDEX `Mod_publisherId_idx`(`publisherId`),
    INDEX `Mod_submittedBy_idx`(`submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Map` (
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

    INDEX `Map_approvedBy_idx`(`approvedBy`),
    INDEX `Map_canonicalDifficultyId_idx`(`canonicalDifficultyId`),
    INDEX `Map_lengthId_idx`(`lengthId`),
    INDEX `Map_mapperUserId_idx`(`mapperUserId`),
    INDEX `Map_modId_idx`(`modId`),
    INDEX `Map_submittedBy_idx`(`submittedBy`),
    UNIQUE INDEX `Map_modId_chapter_side_key`(`modId`, `chapter`, `side`),
    UNIQUE INDEX `Map_modId_name_key`(`modId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MapsToTechs` (
    `mapId` MEDIUMINT UNSIGNED NOT NULL,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `fullClearOnlyBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `MapsToTechs_techId_idx`(`techId`),
    PRIMARY KEY (`mapId`, `techId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mod_Archive` (
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

    INDEX `Mod_Archive_approvedBy_idx`(`approvedBy`),
    INDEX `Mod_Archive_contentWarning_idx`(`contentWarning`),
    INDEX `Mod_Archive_publisherId_idx`(`publisherId`),
    INDEX `Mod_Archive_submittedBy_idx`(`submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Map_Archive` (
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

    INDEX `Map_Archive_approvedBy_idx`(`approvedBy`),
    INDEX `Map_Archive_canonicalDifficultyId_idx`(`canonicalDifficultyId`),
    INDEX `Map_Archive_lengthId_idx`(`lengthId`),
    INDEX `Map_Archive_mapperUserId_idx`(`mapperUserId`),
    INDEX `Map_Archive_mapId_idx`(`mapId`),
    INDEX `Map_Archive_submittedBy_idx`(`submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Map_ArchivesToTechs` (
    `map_ArchiveId` MEDIUMINT UNSIGNED NOT NULL,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `fullClearOnlyBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Map_ArchivesToTechs_techId_idx`(`techId`),
    PRIMARY KEY (`map_ArchiveId`, `techId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mod_Edit` (
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

    INDEX `Mod_Edit_contentWarning_idx`(`contentWarning`),
    INDEX `Mod_Edit_publisherId_idx`(`publisherId`),
    INDEX `Mod_Edit_submittedBy_idx`(`submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Map_Edit` (
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

    INDEX `Map_Edit_canonicalDifficultyId_idx`(`canonicalDifficultyId`),
    INDEX `Map_Edit_lengthId_idx`(`lengthId`),
    INDEX `Map_Edit_mapperUserId_idx`(`mapperUserId`),
    INDEX `Map_Edit_mapId_idx`(`mapId`),
    INDEX `Map_Edit_submittedBy_idx`(`submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Map_EditsToTechs` (
    `map_editId` MEDIUMINT UNSIGNED NOT NULL,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `fullClearOnlyBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Map_EditsToTechs_techId_idx`(`techId`),
    PRIMARY KEY (`map_editId`, `techId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mod_New` (
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

    UNIQUE INDEX `Mod_New_gamebananaModId_key`(`gamebananaModId`),
    INDEX `Mod_New_contentWarning_idx`(`contentWarning`),
    INDEX `Mod_New_publisherId_idx`(`publisherId`),
    INDEX `Mod_New_submittedBy_idx`(`submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Map_NewWithMod_New` (
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

    INDEX `Map_NewWithMod_New_canonicalDifficultyId_idx`(`canonicalDifficultyId`),
    INDEX `Map_NewWithMod_New_lengthId_idx`(`lengthId`),
    INDEX `Map_NewWithMod_New_mapperUserId_idx`(`mapperUserId`),
    INDEX `Map_NewWithMod_New_mod_NewId_idx`(`mod_NewId`),
    INDEX `Map_NewWithMod_New_submittedBy_idx`(`submittedBy`),
    UNIQUE INDEX `Map_NewWithMod_New_mod_NewId_chapter_side_key`(`mod_NewId`, `chapter`, `side`),
    UNIQUE INDEX `Map_NewWithMod_New_mod_NewId_name_key`(`mod_NewId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Map_NewWithMod_NewToTechs` (
    `map_NewWithMod_NewId` MEDIUMINT UNSIGNED NOT NULL,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `fullClearOnlyBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Map_NewWithMod_NewToTechs_techId_idx`(`techId`),
    PRIMARY KEY (`map_NewWithMod_NewId`, `techId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Map_NewSolo` (
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

    INDEX `Map_NewSolo_canonicalDifficultyId_idx`(`canonicalDifficultyId`),
    INDEX `Map_NewSolo_lengthId_idx`(`lengthId`),
    INDEX `Map_NewSolo_mapperUserId_idx`(`mapperUserId`),
    INDEX `Map_NewSolo_modId_idx`(`modId`),
    INDEX `Map_NewSolo_submittedBy_idx`(`submittedBy`),
    UNIQUE INDEX `Map_NewSolo_modId_chapter_side_key`(`modId`, `chapter`, `side`),
    UNIQUE INDEX `Map_NewSolo_modId_name_key`(`modId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Map_NewSoloToTechs` (
    `map_NewSoloId` MEDIUMINT UNSIGNED NOT NULL,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `fullClearOnlyBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Map_NewSoloToTechs_techId_idx`(`techId`),
    PRIMARY KEY (`map_NewSoloId`, `techId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quality` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NOT NULL,
    `description` VARCHAR(100) NOT NULL,
    `order` TINYINT UNSIGNED NOT NULL,

    UNIQUE INDEX `Quality_name_key`(`name`),
    UNIQUE INDEX `Quality_order_key`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rating` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `mapId` MEDIUMINT UNSIGNED NOT NULL,
    `submittedBy` VARCHAR(191) NOT NULL,
    `timeSubmitted` INTEGER NOT NULL,
    `qualityId` TINYINT UNSIGNED NULL,
    `difficultyId` SMALLINT UNSIGNED NULL,

    INDEX `Rating_difficultyId_idx`(`difficultyId`),
    INDEX `Rating_mapId_idx`(`mapId`),
    INDEX `Rating_qualityId_idx`(`qualityId`),
    INDEX `Rating_submittedBy_idx`(`submittedBy`),
    UNIQUE INDEX `Rating_mapId_submittedBy_key`(`mapId`, `submittedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewCollection` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NOT NULL,

    INDEX `ReviewCollection_userId_idx`(`userId`),
    UNIQUE INDEX `ReviewCollection_userId_name_key`(`userId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `modId` SMALLINT UNSIGNED NOT NULL,
    `reviewCollectionId` SMALLINT UNSIGNED NOT NULL,
    `timeSubmitted` INTEGER NOT NULL,
    `likes` VARCHAR(1000) NULL,
    `dislikes` VARCHAR(1000) NULL,
    `otherComments` VARCHAR(1500) NULL,

    INDEX `Review_modId_idx`(`modId`),
    INDEX `Review_reviewCollectionId_idx`(`reviewCollectionId`),
    UNIQUE INDEX `Review_reviewCollectionId_modId_key`(`reviewCollectionId`, `modId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MapReview` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `reviewId` MEDIUMINT UNSIGNED NOT NULL,
    `mapId` MEDIUMINT UNSIGNED NOT NULL,
    `lengthId` TINYINT UNSIGNED NOT NULL,
    `timeSubmitted` INTEGER NOT NULL,
    `likes` VARCHAR(500) NULL,
    `dislikes` VARCHAR(500) NULL,
    `otherComments` VARCHAR(500) NULL,
    `displayRatingBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `MapReview_lengthId_idx`(`lengthId`),
    INDEX `MapReview_mapId_idx`(`mapId`),
    INDEX `MapReview_reviewId_idx`(`reviewId`),
    UNIQUE INDEX `MapReview_reviewId_mapId_key`(`reviewId`, `mapId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsersToCompletedMaps` (
    `userId` VARCHAR(191) NOT NULL,
    `mapId` MEDIUMINT UNSIGNED NOT NULL,

    INDEX `UsersToCompletedMaps_mapId_idx`(`mapId`),
    PRIMARY KEY (`userId`, `mapId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
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

    UNIQUE INDEX `User_discordUsername_discordDiscriminator_key`(`discordUsername`, `discordDiscriminator`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
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

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Difficulty` ADD CONSTRAINT `Difficulty_parentDifficultyId_fkey` FOREIGN KEY (`parentDifficultyId`) REFERENCES `Difficulty`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Tech` ADD CONSTRAINT `Tech_difficultyId_fkey` FOREIGN KEY (`difficultyId`) REFERENCES `Difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `TechVideo` ADD CONSTRAINT `TechVideo_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `Tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Publisher` ADD CONSTRAINT `Publisher_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mod` ADD CONSTRAINT `Mod_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `Publisher`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mod` ADD CONSTRAINT `Mod_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mod` ADD CONSTRAINT `Mod_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map` ADD CONSTRAINT `Map_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `Mod`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map` ADD CONSTRAINT `Map_mapperUserId_fkey` FOREIGN KEY (`mapperUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map` ADD CONSTRAINT `Map_canonicalDifficultyId_fkey` FOREIGN KEY (`canonicalDifficultyId`) REFERENCES `Difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map` ADD CONSTRAINT `Map_lengthId_fkey` FOREIGN KEY (`lengthId`) REFERENCES `Length`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map` ADD CONSTRAINT `Map_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map` ADD CONSTRAINT `Map_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `MapsToTechs` ADD CONSTRAINT `MapsToTechs_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `Map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `MapsToTechs` ADD CONSTRAINT `MapsToTechs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `Tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mod_Archive` ADD CONSTRAINT `Mod_Archive_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `Mod`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mod_Archive` ADD CONSTRAINT `Mod_Archive_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `Publisher`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mod_Archive` ADD CONSTRAINT `Mod_Archive_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mod_Archive` ADD CONSTRAINT `Mod_Archive_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_Archive` ADD CONSTRAINT `Map_Archive_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `Map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_Archive` ADD CONSTRAINT `Map_Archive_mapperUserId_fkey` FOREIGN KEY (`mapperUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_Archive` ADD CONSTRAINT `Map_Archive_canonicalDifficultyId_fkey` FOREIGN KEY (`canonicalDifficultyId`) REFERENCES `Difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_Archive` ADD CONSTRAINT `Map_Archive_lengthId_fkey` FOREIGN KEY (`lengthId`) REFERENCES `Length`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_Archive` ADD CONSTRAINT `Map_Archive_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_Archive` ADD CONSTRAINT `Map_Archive_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_ArchivesToTechs` ADD CONSTRAINT `Map_ArchivesToTechs_map_ArchiveId_fkey` FOREIGN KEY (`map_ArchiveId`) REFERENCES `Map_Archive`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_ArchivesToTechs` ADD CONSTRAINT `Map_ArchivesToTechs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `Tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mod_Edit` ADD CONSTRAINT `Mod_Edit_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `Mod`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mod_Edit` ADD CONSTRAINT `Mod_Edit_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `Publisher`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mod_Edit` ADD CONSTRAINT `Mod_Edit_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_Edit` ADD CONSTRAINT `Map_Edit_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `Map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_Edit` ADD CONSTRAINT `Map_Edit_mapperUserId_fkey` FOREIGN KEY (`mapperUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_Edit` ADD CONSTRAINT `Map_Edit_canonicalDifficultyId_fkey` FOREIGN KEY (`canonicalDifficultyId`) REFERENCES `Difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_Edit` ADD CONSTRAINT `Map_Edit_lengthId_fkey` FOREIGN KEY (`lengthId`) REFERENCES `Length`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_Edit` ADD CONSTRAINT `Map_Edit_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_EditsToTechs` ADD CONSTRAINT `Map_EditsToTechs_map_editId_fkey` FOREIGN KEY (`map_editId`) REFERENCES `Map_Edit`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_EditsToTechs` ADD CONSTRAINT `Map_EditsToTechs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `Tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mod_New` ADD CONSTRAINT `Mod_New_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `Publisher`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mod_New` ADD CONSTRAINT `Mod_New_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewWithMod_New` ADD CONSTRAINT `Map_NewWithMod_New_mod_NewId_fkey` FOREIGN KEY (`mod_NewId`) REFERENCES `Mod_New`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewWithMod_New` ADD CONSTRAINT `Map_NewWithMod_New_mapperUserId_fkey` FOREIGN KEY (`mapperUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewWithMod_New` ADD CONSTRAINT `Map_NewWithMod_New_canonicalDifficultyId_fkey` FOREIGN KEY (`canonicalDifficultyId`) REFERENCES `Difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewWithMod_New` ADD CONSTRAINT `Map_NewWithMod_New_lengthId_fkey` FOREIGN KEY (`lengthId`) REFERENCES `Length`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewWithMod_New` ADD CONSTRAINT `Map_NewWithMod_New_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewWithMod_NewToTechs` ADD CONSTRAINT `Map_NewWithMod_NewToTechs_map_NewWithMod_NewId_fkey` FOREIGN KEY (`map_NewWithMod_NewId`) REFERENCES `Map_NewWithMod_New`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewWithMod_NewToTechs` ADD CONSTRAINT `Map_NewWithMod_NewToTechs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `Tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewSolo` ADD CONSTRAINT `Map_NewSolo_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `Mod`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewSolo` ADD CONSTRAINT `Map_NewSolo_mapperUserId_fkey` FOREIGN KEY (`mapperUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewSolo` ADD CONSTRAINT `Map_NewSolo_canonicalDifficultyId_fkey` FOREIGN KEY (`canonicalDifficultyId`) REFERENCES `Difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewSolo` ADD CONSTRAINT `Map_NewSolo_lengthId_fkey` FOREIGN KEY (`lengthId`) REFERENCES `Length`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewSolo` ADD CONSTRAINT `Map_NewSolo_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewSoloToTechs` ADD CONSTRAINT `Map_NewSoloToTechs_map_NewSoloId_fkey` FOREIGN KEY (`map_NewSoloId`) REFERENCES `Map_NewSolo`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Map_NewSoloToTechs` ADD CONSTRAINT `Map_NewSoloToTechs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `Tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `Map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_submittedBy_fkey` FOREIGN KEY (`submittedBy`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_qualityId_fkey` FOREIGN KEY (`qualityId`) REFERENCES `Quality`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_difficultyId_fkey` FOREIGN KEY (`difficultyId`) REFERENCES `Difficulty`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ReviewCollection` ADD CONSTRAINT `ReviewCollection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `Mod`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_reviewCollectionId_fkey` FOREIGN KEY (`reviewCollectionId`) REFERENCES `ReviewCollection`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `MapReview` ADD CONSTRAINT `MapReview_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `MapReview` ADD CONSTRAINT `MapReview_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `Map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `MapReview` ADD CONSTRAINT `MapReview_lengthId_fkey` FOREIGN KEY (`lengthId`) REFERENCES `Length`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `UsersToCompletedMaps` ADD CONSTRAINT `UsersToCompletedMaps_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `UsersToCompletedMaps` ADD CONSTRAINT `UsersToCompletedMaps_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `Map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
