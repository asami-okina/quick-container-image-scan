import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Vulnerability, License } from "@/lib/schemas/scan";
import { VulnerabilityDetails } from "./vulnerability-details";
import { LicenseDetails } from "./license-details";

type ScanResultsTabsProps = {
  vulnerabilitiesByTarget: Record<string, Vulnerability[]>;
  licensesByTarget: Record<string, License[]>;
};

export function ScanResultsTabs({
  vulnerabilitiesByTarget,
  licensesByTarget,
}: ScanResultsTabsProps) {
  const allVulnerabilities = Object.values(vulnerabilitiesByTarget).flat();
  const allLicenses = Object.values(licensesByTarget).flat();

  return (
    <Tabs defaultValue="vulnerabilities">
      <TabsList>
        <TabsTrigger value="vulnerabilities">
          Vulnerabilities ({allVulnerabilities.length})
        </TabsTrigger>
        <TabsTrigger value="licenses">
          Licenses ({allLicenses.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="vulnerabilities">
        <VulnerabilityDetails
          vulnerabilitiesByTarget={vulnerabilitiesByTarget}
        />
      </TabsContent>

      <TabsContent value="licenses">
        <LicenseDetails licensesByTarget={licensesByTarget} />
      </TabsContent>
    </Tabs>
  );
}
