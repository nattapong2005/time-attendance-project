/*
  Warnings:

  - You are about to drop the column `locationId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `internshiplocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_locationId_fkey`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `locationId`;

-- DropTable
DROP TABLE `internshiplocation`;
