// This tells tsx the exact file to load
import { PrismaClient } from '../generated/prisma/client.ts';

const prisma = new PrismaClient();

export default prisma;