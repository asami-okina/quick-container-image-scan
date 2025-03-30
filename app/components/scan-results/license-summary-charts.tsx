import { Badge } from "@/app/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { License } from "@/lib/schemas/scan";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";

type LicenseSummaryChartsProps = {
  licensesByTarget: Record<string, License[]>;
};

export function LicenseSummaryCharts({
  licensesByTarget,
}: LicenseSummaryChartsProps) {
  const targets = Object.keys(licensesByTarget);
  const firstTarget = targets[0];

  return (
    <div className="mb-6">
      <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 shadow-md border border-white/50">
        <h3 className="text-lg font-medium mb-2 text-gray-700 font-montserrat">
          License Summary
        </h3>
        <Tabs defaultValue={firstTarget}>
          <TabsList>
            {targets.map((target) => (
              <TabsTrigger key={target} value={target}>
                {target}
              </TabsTrigger>
            ))}
          </TabsList>
          {targets.map((target) => {
            const licenses = licensesByTarget[target];
            const targetLicenseCounts = {
              CRITICAL: licenses.filter((l) => l.Severity === "CRITICAL")
                .length,
              HIGH: licenses.filter((l) => l.Severity === "HIGH").length,
              MEDIUM: licenses.filter((l) => l.Severity === "MEDIUM").length,
              LOW: licenses.filter((l) => l.Severity === "LOW").length,
              UNKNOWN: licenses.filter((l) => l.Severity === "UNKNOWN").length,
            };

            const targetLicenseChartData = [
              {
                name: "Critical",
                value: targetLicenseCounts.CRITICAL,
                color: "#f87171",
              },
              {
                name: "High",
                value: targetLicenseCounts.HIGH,
                color: "#fb923c",
              },
              {
                name: "Medium",
                value: targetLicenseCounts.MEDIUM,
                color: "#facc15",
              },
              {
                name: "Low",
                value: targetLicenseCounts.LOW,
                color: "#ec4899",
              },
              {
                name: "Unknown",
                value: targetLicenseCounts.UNKNOWN,
                color: "#94a3b8",
              },
            ].filter((item) => item.value > 0);

            return (
              <TabsContent key={target} value={target}>
                <div className="backdrop-blur-sm bg-white/20 rounded-xl p-4 shadow-sm border border-white/30">
                  <h4 className="text-md font-medium mb-2 text-gray-700 font-montserrat text-center">
                    {target}
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={targetLicenseChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {targetLicenseChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-medium">
                      Total: {licenses.length} (UNKNOWN:{" "}
                      {targetLicenseCounts.UNKNOWN}, LOW:{" "}
                      {targetLicenseCounts.LOW}, MEDIUM:{" "}
                      {targetLicenseCounts.MEDIUM}, HIGH:{" "}
                      {targetLicenseCounts.HIGH}, CRITICAL:{" "}
                      {targetLicenseCounts.CRITICAL})
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {targetLicenseCounts.UNKNOWN > 0 && (
                      <Badge className="bg-gradient-to-r from-gray-400 to-gray-500">
                        Unknown: {targetLicenseCounts.UNKNOWN}
                      </Badge>
                    )}
                    {targetLicenseCounts.LOW > 0 && (
                      <Badge className="bg-gradient-to-r from-pink-400 to-pink-500">
                        Low: {targetLicenseCounts.LOW}
                      </Badge>
                    )}
                    {targetLicenseCounts.MEDIUM > 0 && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500">
                        Medium: {targetLicenseCounts.MEDIUM}
                      </Badge>
                    )}
                    {targetLicenseCounts.HIGH > 0 && (
                      <Badge className="bg-gradient-to-r from-orange-400 to-orange-500">
                        High: {targetLicenseCounts.HIGH}
                      </Badge>
                    )}
                    {targetLicenseCounts.CRITICAL > 0 && (
                      <Badge className="bg-gradient-to-r from-red-400 to-red-500">
                        Critical: {targetLicenseCounts.CRITICAL}
                      </Badge>
                    )}
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
