-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assigneeId" INTEGER;

-- CreateTable
CREATE TABLE "TaskProposal" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userDetailsId" INTEGER NOT NULL,
    "message" TEXT,
    "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskProposal_status_idx" ON "TaskProposal"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TaskProposal_taskId_userDetailsId_key" ON "TaskProposal"("taskId", "userDetailsId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskProposal" ADD CONSTRAINT "TaskProposal_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskProposal" ADD CONSTRAINT "TaskProposal_userDetailsId_fkey" FOREIGN KEY ("userDetailsId") REFERENCES "UserDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
