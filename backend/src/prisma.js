// Import Prisma Client correctly
import { PrismaClient } from "@prisma/client";

// Create single Prisma instance
const prisma = new PrismaClient();

// Export it
export default prisma;