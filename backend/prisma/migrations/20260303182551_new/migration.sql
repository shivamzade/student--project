/*
  Warnings:

  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `studentId` on the `Mark` table. All the data in the column will be lost.
  - Added the required column `memberId` to the `Mark` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Student_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Student";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberName" TEXT NOT NULL,
    "memberEmail" TEXT NOT NULL,
    "memberAge" INTEGER NOT NULL,
    "memberParentId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_memberParentId_fkey" FOREIGN KEY ("memberParentId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mark" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subject" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    CONSTRAINT "Mark_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Mark" ("id", "score", "subject") SELECT "id", "score", "subject" FROM "Mark";
DROP TABLE "Mark";
ALTER TABLE "new_Mark" RENAME TO "Mark";
CREATE INDEX "Mark_memberId_idx" ON "Mark"("memberId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberEmail_key" ON "Member"("memberEmail");

-- CreateIndex
CREATE INDEX "Member_memberParentId_idx" ON "Member"("memberParentId");
