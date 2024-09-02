/*
  Warnings:

  - A unique constraint covering the columns `[sessionToken]` on the table `session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `user-claim` (
    `claimByUserId` VARCHAR(191) NOT NULL,
    `claimForUserId` VARCHAR(191) NOT NULL,
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,

    INDEX `user-claim_claimByUserId_idx`(`claimByUserId`),
    UNIQUE INDEX `user-claim_claimByUserId_claimForUserId_key`(`claimByUserId`, `claimForUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `session_sessionToken_key` ON `session`(`sessionToken`);

-- AddForeignKey
ALTER TABLE `user-claim` ADD CONSTRAINT `user-claim_claimByUserId_fkey` FOREIGN KEY (`claimByUserId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user-claim` ADD CONSTRAINT `user-claim_claimForUserId_fkey` FOREIGN KEY (`claimForUserId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
