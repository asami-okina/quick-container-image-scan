-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'SCANNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "artifactName" TEXT NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,

    CONSTRAINT "ScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanResult" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "type" TEXT,
    "scanId" TEXT NOT NULL,

    CONSTRAINT "ScanResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vulnerability" (
    "id" TEXT NOT NULL,
    "vulnerabilityId" TEXT NOT NULL,
    "pkgName" TEXT NOT NULL,
    "installedVersion" TEXT NOT NULL,
    "fixedVersion" TEXT,
    "status" TEXT NOT NULL,
    "primaryUrl" TEXT,
    "title" TEXT,
    "severity" TEXT NOT NULL,
    "references" TEXT[],
    "scanResultId" TEXT NOT NULL,

    CONSTRAINT "Vulnerability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pkgName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scanResultId" TEXT NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanResult" ADD CONSTRAINT "ScanResult_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vulnerability" ADD CONSTRAINT "Vulnerability_scanResultId_fkey" FOREIGN KEY ("scanResultId") REFERENCES "ScanResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_scanResultId_fkey" FOREIGN KEY ("scanResultId") REFERENCES "ScanResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
