import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test basic connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test counting teams
    const teamCount = await prisma.team.count();
    
    // Test counting features
    const featureCount = await prisma.feature.count();
    
    return NextResponse.json({ 
      status: "ok", 
      teamCount, 
      featureCount,
      databaseUrl: process.env.DATABASE_URL ? "set" : "not set"
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      code: error.code,
      stack: error.stack 
    }, { status: 500 });
  }
}
