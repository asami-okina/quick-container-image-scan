import { Badge } from "@/app/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { License } from "@/lib/schemas/scan";

type LicenseDetailsProps = {
  licensesByTarget: Record<string, License[]>;
};

export function LicenseDetails({ licensesByTarget }: LicenseDetailsProps) {
  const getLicenseSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "HIGH":
        return "bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600";
      case "MEDIUM":
        return "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600";
      case "LOW":
        return "bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600";
    }
  };

  const getLicenseCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case "restricted":
        return "Restricted";
      case "reciprocal":
        return "Reciprocal";
      case "notice":
        return "Notice";
      case "unknown":
      default:
        return "Unknown";
    }
  };

  return (
    <Tabs defaultValue={Object.keys(licensesByTarget)[0]}>
      <TabsList>
        {Object.entries(licensesByTarget).map(([target, licenses]) => (
          <TabsTrigger key={target} value={target}>
            {target} ({licenses.length})
          </TabsTrigger>
        ))}
      </TabsList>

      {Object.entries(licensesByTarget).map(([target, licenses]) => (
        <TabsContent key={target} value={target}>
          <div className="rounded-lg overflow-hidden bg-white/30 backdrop-blur-sm shadow-md">
            <Table>
              <TableHeader className="bg-black/5">
                <TableRow>
                  <TableHead className="font-montserrat">Package</TableHead>
                  <TableHead className="font-montserrat">License</TableHead>
                  <TableHead className="font-montserrat">
                    Classification
                  </TableHead>
                  <TableHead className="font-montserrat">Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map((license: License, index: number) => (
                  <TableRow key={index} className="hover:bg-white/30">
                    <TableCell>{license.PkgName}</TableCell>
                    <TableCell>{license.Name}</TableCell>
                    <TableCell>
                      {getLicenseCategory(license.Category)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getLicenseSeverityColor(license.Severity)}
                      >
                        {license.Severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
