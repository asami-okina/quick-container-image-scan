"use server";

import { prisma } from "../../prisma/prisma-client";

export async function getScanStatus(scanId: string) {
  try {
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: {
        logs: {
          orderBy: {
            createdAt: "asc",
          },
        },
        results: {
          include: {
            vulnerabilities: true,
            licenses: true,
          },
        },
      },
    });

    return scan;
  } catch (error) {
    console.error("Error fetching scan status:", error);
    throw new Error("Failed to fetch scan status");
  }
}
