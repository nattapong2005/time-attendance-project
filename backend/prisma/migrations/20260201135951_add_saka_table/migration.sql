-- AlterTable
ALTER TABLE `user` ADD COLUMN `sakaId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Saka` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saka_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_sakaId_fkey` FOREIGN KEY (`sakaId`) REFERENCES `Saka`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
