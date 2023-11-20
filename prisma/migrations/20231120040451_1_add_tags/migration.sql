/*
  Warnings:

  - You are about to drop the `map-edits-to-techs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `maps-to-techs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mod-archives-to-techs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `map-edits-to-techs` DROP FOREIGN KEY `map-edits-to-techs_map_editId_fkey`;

-- DropForeignKey
ALTER TABLE `map-edits-to-techs` DROP FOREIGN KEY `map-edits-to-techs_techId_fkey`;

-- DropForeignKey
ALTER TABLE `maps-to-techs` DROP FOREIGN KEY `maps-to-techs_mapId_fkey`;

-- DropForeignKey
ALTER TABLE `maps-to-techs` DROP FOREIGN KEY `maps-to-techs_techId_fkey`;

-- DropForeignKey
ALTER TABLE `mod-archives-to-techs` DROP FOREIGN KEY `mod-archives-to-techs_map_ArchiveId_fkey`;

-- DropForeignKey
ALTER TABLE `mod-archives-to-techs` DROP FOREIGN KEY `mod-archives-to-techs_techId_fkey`;

-- DropTable
DROP TABLE `map-edits-to-techs`;

-- DropTable
DROP TABLE `maps-to-techs`;

-- DropTable
DROP TABLE `mod-archives-to-techs`;

-- CreateTable
CREATE TABLE `tag` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `tag_name_key`(`name`),
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
CREATE TABLE `map-to-techs` (
    `mapId` MEDIUMINT UNSIGNED NOT NULL,
    `techId` SMALLINT UNSIGNED NOT NULL,
    `fullClearOnlyBool` BOOLEAN NOT NULL DEFAULT false,

    INDEX `map-to-techs_techId_idx`(`techId`),
    PRIMARY KEY (`mapId`, `techId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mod-archive-to-tags` (
    `mod_ArchiveId` SMALLINT UNSIGNED NOT NULL,
    `tagId` TINYINT UNSIGNED NOT NULL,

    INDEX `mod-archive-to-tags_tagId_idx`(`tagId`),
    PRIMARY KEY (`mod_ArchiveId`, `tagId`)
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
CREATE TABLE `mod-edit-to-tags` (
    `mod_EditId` SMALLINT UNSIGNED NOT NULL,
    `tagId` TINYINT UNSIGNED NOT NULL,

    INDEX `mod-edit-to-tags_tagId_idx`(`tagId`),
    PRIMARY KEY (`mod_EditId`, `tagId`)
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
CREATE TABLE `mod-new-to-tags` (
    `mod_NewId` SMALLINT UNSIGNED NOT NULL,
    `tagId` TINYINT UNSIGNED NOT NULL,

    INDEX `mod-new-to-tags_tagId_idx`(`tagId`),
    PRIMARY KEY (`mod_NewId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mod-to-tags` ADD CONSTRAINT `mod-to-tags_modId_fkey` FOREIGN KEY (`modId`) REFERENCES `mod`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-to-tags` ADD CONSTRAINT `mod-to-tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-to-techs` ADD CONSTRAINT `map-to-techs_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `map`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-to-techs` ADD CONSTRAINT `map-to-techs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-archive-to-tags` ADD CONSTRAINT `mod-archive-to-tags_mod_ArchiveId_fkey` FOREIGN KEY (`mod_ArchiveId`) REFERENCES `mod-archive`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-archive-to-tags` ADD CONSTRAINT `mod-archive-to-tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-archive-to-techs` ADD CONSTRAINT `mod-archive-to-techs_map_ArchiveId_fkey` FOREIGN KEY (`map_ArchiveId`) REFERENCES `map-archive`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-archive-to-techs` ADD CONSTRAINT `mod-archive-to-techs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-edit-to-tags` ADD CONSTRAINT `mod-edit-to-tags_mod_EditId_fkey` FOREIGN KEY (`mod_EditId`) REFERENCES `mod-edit`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-edit-to-tags` ADD CONSTRAINT `mod-edit-to-tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-edit-to-techs` ADD CONSTRAINT `map-edit-to-techs_map_editId_fkey` FOREIGN KEY (`map_editId`) REFERENCES `map-edit`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `map-edit-to-techs` ADD CONSTRAINT `map-edit-to-techs_techId_fkey` FOREIGN KEY (`techId`) REFERENCES `tech`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-new-to-tags` ADD CONSTRAINT `mod-new-to-tags_mod_NewId_fkey` FOREIGN KEY (`mod_NewId`) REFERENCES `mod-edit`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mod-new-to-tags` ADD CONSTRAINT `mod-new-to-tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
