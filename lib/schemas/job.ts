import { z } from "zod";
export const createJobSchema = z.object({
  ArtifactName: z.string().min(1, "Please enter the image name"),
});

export type CreateJobSchemaType = z.infer<typeof createJobSchema>;
