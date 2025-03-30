import { z } from "zod";

const VulnerabilitySchema = z.object({
  VulnerabilityID: z.string(),
  PkgName: z.string(),
  InstalledVersion: z.string(),
  FixedVersion: z.string().optional(),
  Status: z.string(),
  PrimaryURL: z.string().optional(),
  Title: z.string().optional(),
  Severity: z.string(),
  References: z.array(z.string()).optional(),
});

const LicenseSchema = z.object({
  Severity: z.string(),
  Category: z.enum(["restricted", "reciprocal", "notice", "unknown"]),
  PkgName: z.string(),
  Name: z.string(),
});

const ScanResultSchema = z.object({
  Target: z.string(),
  Class: z.string(),
  Type: z.string().optional(),
  Vulnerabilities: z.array(VulnerabilitySchema).optional(),
  Licenses: z.array(LicenseSchema).optional(),
});

const ScanResultsSchema = z.object({
  CreatedAt: z.string(),
  ArtifactName: z.string(),
  Results: z.array(ScanResultSchema),
});

export type Vulnerability = z.infer<typeof VulnerabilitySchema>;
export type License = z.infer<typeof LicenseSchema>;
type ScanResult = z.infer<typeof ScanResultSchema>;
export type ScanResultsType = z.infer<typeof ScanResultsSchema>;
