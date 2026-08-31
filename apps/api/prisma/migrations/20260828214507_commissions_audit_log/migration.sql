-- CreateEnum
CREATE TYPE "ServiceCommissionStatus" AS ENUM ('OWED', 'SETTLED');

-- CreateTable
CREATE TABLE "service_commissions" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "ServiceCommissionStatus" NOT NULL DEFAULT 'OWED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_actions" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_commissions_jobPostId_key" ON "service_commissions"("jobPostId");
