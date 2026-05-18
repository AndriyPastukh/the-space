/*
  Warnings:

  - A unique constraint covering the columns `[taskId,authorId,userDetailsId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "taskId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Review_taskId_authorId_userDetailsId_key" ON "Review"("taskId", "authorId", "userDetailsId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
