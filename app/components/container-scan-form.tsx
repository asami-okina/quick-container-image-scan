"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { createJobSchema, CreateJobSchemaType } from "@/lib/schemas/job";
import { createScanAction } from "@/app/actions/scan";
import ScanProgress from "./scan-progress";
import ScanResults from "./scan-results";
import { useScanStatus } from "@/app/hooks/use-scan-status";

export default function ContainerScanForm() {
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const { scan, status: scanStatus } = useScanStatus(currentScanId);

  const logs = useMemo(() => {
    return (
      scan?.logs.map((log) => ({
        message: log.message,
        createdAt: log.createdAt,
      })) ?? []
    );
  }, [scan?.logs]);

  const currentTimeString = useMemo(() => {
    return new Date().toLocaleTimeString();
  }, []);

  const scanResults = useMemo(() => {
    if (!scan || scanStatus !== "COMPLETED") return null;
    return {
      ArtifactName: scan.artifactName,
      CreatedAt: scan.createdAt.toISOString(),
      Results: scan.results.map((result) => ({
        Target: result.target,
        Class: result.class,
        Type: result.type || undefined,
        Vulnerabilities:
          result.vulnerabilities.length > 0
            ? result.vulnerabilities.map((vuln) => ({
                VulnerabilityID: vuln.vulnerabilityId,
                PkgName: vuln.pkgName,
                InstalledVersion: vuln.installedVersion,
                FixedVersion: vuln.fixedVersion || undefined,
                Status: vuln.status,
                PrimaryURL: vuln.primaryUrl || undefined,
                Title: vuln.title || undefined,
                Severity: vuln.severity,
                References: vuln.references,
              }))
            : undefined,
        Licenses:
          result.licenses.length > 0
            ? result.licenses.map((license) => ({
                Severity: license.severity,
                Category: license.category as
                  | "unknown"
                  | "restricted"
                  | "reciprocal"
                  | "notice",
                PkgName: license.pkgName,
                Name: license.name,
              }))
            : undefined,
      })),
    };
  }, [scan, scanStatus]);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateJobSchemaType>({
    resolver: zodResolver(createJobSchema),
  });

  const { execute, status, result } = useAction(createScanAction, {
    onSuccess: ({ data }) => {
      if (data?.scan) {
        setCurrentScanId(data.scan.id);
      }
    },
  });

  return (
    <div className="space-y-4 w-full max-w-[95vw] mx-auto">
      <form onSubmit={handleSubmit(execute)} className="glass-card p-6">
        <div className="pb-3">
          <h2 className="text-lg font-medium bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent font-montserrat">
            Container Image Scanner
          </h2>
        </div>

        <div className="flex gap-2">
          <Input
            control={control}
            name="ArtifactName"
            placeholder="Enter container image name (e.g. nginx:latest)"
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={
              status === "executing" ||
              scanStatus === "PENDING" ||
              scanStatus === "SCANNING"
            }
            className="bg-gradient-to-r from-pink-600 to-orange-600 text-white"
          >
            {status === "executing"
              ? "Creating job..."
              : scanStatus === "PENDING"
              ? "Preparing scan..."
              : scanStatus === "SCANNING"
              ? "Scanning..."
              : "Start scan"}
          </Button>
        </div>

        {errors.ArtifactName && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{errors.ArtifactName.message}</AlertDescription>
          </Alert>
        )}

        {result?.serverError && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>
              {result.serverError.serverError}
            </AlertDescription>
          </Alert>
        )}
      </form>

      <div className="space-y-4">
        <ScanProgress
          logs={logs}
          isScanning={
            status === "executing" ||
            scanStatus === "PENDING" ||
            scanStatus === "SCANNING"
          }
          currentTime={currentTimeString}
        />
        {scanResults && <ScanResults results={scanResults} />}
      </div>
    </div>
  );
}
