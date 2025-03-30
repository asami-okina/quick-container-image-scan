"use server";

import { ScanResultsType } from "@/lib/schemas/scan";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Note: Dev-only: Run `trivy image` directly without using a Job
export async function fetchScanResults(
  imageUrl: string
): Promise<ScanResultsType> {
  try {
    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    const { stdout } = await execAsync(
      `trivy image --scanners vuln,license --format json ${imageUrl}`,
      { maxBuffer: 1024 * 1024 * 20 }
    );

    const trivyResults = JSON.parse(stdout);
    return {
      CreatedAt: new Date().toISOString(),
      ArtifactName: imageUrl,
      Results: trivyResults.Results || [],
    };
  } catch (error) {
    console.error("Error executing trivy command:", error);
    throw new Error("Failed to scan container image");
  }
}
