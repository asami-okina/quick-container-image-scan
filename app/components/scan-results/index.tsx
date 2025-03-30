"use client";

import { ScanResultsType, Vulnerability, License } from "@/lib/schemas/scan";
import { ScanResultsHeader } from "./scan-results-header";
import { ScanSummaryTable } from "./scan-summary-table";
import { VulnerabilitySummaryCharts } from "./vulnerability-summary-charts";
import { LicenseSummaryCharts } from "./license-summary-charts";
import { ScanResultsTabs } from "./scan-results-tabs";

type ScanResultsProps = {
  results: ScanResultsType;
};

export default function ScanResults({ results }: ScanResultsProps) {
  const vulnerabilitiesByTarget = results.Results.reduce<
    Record<string, Vulnerability[]>
  >((acc, result) => {
    if (result.Vulnerabilities && result.Vulnerabilities.length > 0) {
      acc[result.Target] = result.Vulnerabilities;
    }
    return acc;
  }, {});

  const licensesByTarget = results.Results.reduce<Record<string, License[]>>(
    (acc, result) => {
      if (
        result.Class === "license" &&
        result.Licenses &&
        result.Licenses.length > 0
      ) {
        acc[result.Target] = result.Licenses;
      }
      return acc;
    },
    {}
  );

  return (
    <div className="glass-card p-4 w-full max-w-[95vw] mx-auto">
      <ScanResultsHeader
        artifactName={results.ArtifactName}
        createdAt={results.CreatedAt}
      />

      <ScanSummaryTable results={results.Results} />

      <VulnerabilitySummaryCharts
        vulnerabilitiesByTarget={vulnerabilitiesByTarget}
      />

      <LicenseSummaryCharts licensesByTarget={licensesByTarget} />

      <ScanResultsTabs
        vulnerabilitiesByTarget={vulnerabilitiesByTarget}
        licensesByTarget={licensesByTarget}
      />
    </div>
  );
}
