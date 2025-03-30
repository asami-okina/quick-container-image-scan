"use client";

import { useEffect, useState } from "react";
import { getScanStatus } from "@/app/actions/get-scan-status";

type ScanWithResults = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  artifactName: string;
  status: "PENDING" | "SCANNING" | "COMPLETED" | "FAILED";
  errorMessage: string | null;
  logs: {
    id: string;
    createdAt: Date;
    message: string;
  }[];
  results: {
    id: string;
    target: string;
    class: string;
    type: string | null;
    vulnerabilities: {
      id: string;
      vulnerabilityId: string;
      pkgName: string;
      installedVersion: string;
      fixedVersion: string | null;
      status: string;
      primaryUrl: string | null;
      title: string | null;
      severity: string;
      references: string[];
    }[];
    licenses: {
      id: string;
      severity: string;
      category: string;
      pkgName: string;
      name: string;
    }[];
  }[];
};

export function useScanStatus(scanId: string | null) {
  const [scanData, setScanData] = useState<ScanWithResults | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!scanId) return;

    let intervalId: NodeJS.Timeout | null = null;

    const fetchScanStatus = async () => {
      try {
        const scan = await getScanStatus(scanId);

        if (scan) {
          setScanData(scan as ScanWithResults);

          // COMPLETED または FAILED の場合はポーリングを停止
          if (scan.status === "COMPLETED" || scan.status === "FAILED") {
            setIsPolling(false);
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching scan status:", error);
      }
    };

    fetchScanStatus();

    setIsPolling(true);
    intervalId = setInterval(fetchScanStatus, 3000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      setIsPolling(false);
    };
  }, [scanId]);

  return {
    scan: scanData,
    status: scanData?.status,
    errorMessage: scanData?.errorMessage,
    isPolling,
  };
}
