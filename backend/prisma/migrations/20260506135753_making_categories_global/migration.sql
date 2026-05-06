/*
  Warnings:

  - You are about to drop the column `category` on the `Category` table. All the data in the column will be lost.
  - The primary key for the `_KnowledgeOffers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_KnowledgeRequests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `KnowledgeCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TaskToTaskCategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `A` on the `_KnowledgeOffers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_KnowledgeRequests` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_KnowledgeOffers" DROP CONSTRAINT "_KnowledgeOffers_A_fkey";

-- DropForeignKey
ALTER TABLE "_KnowledgeOffers" DROP CONSTRAINT "_KnowledgeOffers_B_fkey";

-- DropForeignKey
ALTER TABLE "_KnowledgeRequests" DROP CONSTRAINT "_KnowledgeRequests_A_fkey";

-- DropForeignKey
ALTER TABLE "_KnowledgeRequests" DROP CONSTRAINT "_KnowledgeRequests_B_fkey";

-- DropForeignKey
ALTER TABLE "_TaskToTaskCategory" DROP CONSTRAINT "_TaskToTaskCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskToTaskCategory" DROP CONSTRAINT "_TaskToTaskCategory_B_fkey";

-- DropIndex
DROP INDEX "Category_category_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "category",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "_KnowledgeOffers" DROP CONSTRAINT "_KnowledgeOffers_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
ADD CONSTRAINT "_KnowledgeOffers_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_KnowledgeRequests" DROP CONSTRAINT "_KnowledgeRequests_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
ADD CONSTRAINT "_KnowledgeRequests_AB_pkey" PRIMARY KEY ("A", "B");

-- DropTable
DROP TABLE "KnowledgeCategory";

-- DropTable
DROP TABLE "TaskCategory";

-- DropTable
DROP TABLE "_TaskToTaskCategory";

-- CreateTable
CREATE TABLE "_CategoryToTask" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryToTask_B_index" ON "_CategoryToTask"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "_CategoryToTask" ADD CONSTRAINT "_CategoryToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToTask" ADD CONSTRAINT "_CategoryToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KnowledgeOffers" ADD CONSTRAINT "_KnowledgeOffers_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KnowledgeOffers" ADD CONSTRAINT "_KnowledgeOffers_B_fkey" FOREIGN KEY ("B") REFERENCES "Knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KnowledgeRequests" ADD CONSTRAINT "_KnowledgeRequests_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KnowledgeRequests" ADD CONSTRAINT "_KnowledgeRequests_B_fkey" FOREIGN KEY ("B") REFERENCES "Knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
