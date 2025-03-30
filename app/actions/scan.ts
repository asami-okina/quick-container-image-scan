"use server";

import { actionClient } from "@/lib/safe-action";
import { logger } from "@/lib/logger";
import { BusinessError } from "@/lib/error";
import { revalidatePath } from "next/cache";
import { createJob } from "./create-job";
import { createJobSchema } from "@/lib/schemas/job";
import { prisma } from "../../prisma/prisma-client";

export const createScanAction = actionClient
  .schema(createJobSchema)
  .action(async ({ parsedInput }) => {
    logger.debug("Creating scan job for image:", parsedInput.ArtifactName);

    const scan = await prisma.scan.create({
      data: {
        artifactName: parsedInput.ArtifactName,
        status: "PENDING",
        errorMessage: null,
        logs: {
          create: [
            {
              message: `Starting scan for image ${parsedInput.ArtifactName}...`,
            },
          ],
        },
      },
    });

    try {
      await createJob({ id: scan.id, artifactName: parsedInput.ArtifactName });

      await prisma.scanLog.create({
        data: {
          scanId: scan.id,
          message: `Scan job created: ${scan.id}`,
        },
      });

      revalidatePath("/");
      return { scan };
    } catch (error) {
      logger.error("Error creating scan job:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to create job";

      await prisma.scan.update({
        where: { id: scan.id },
        data: {
          status: "FAILED",
          errorMessage: errorMessage,
          logs: {
            create: [
              {
                message: `Error: ${errorMessage}`,
              },
            ],
          },
        },
      });

      throw new BusinessError("Failed to create scan job");
    }
  });
