import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { ScanResultsType } from "@/lib/schemas/scan";

type ScanSummaryTableProps = {
  results: ScanResultsType["Results"];
};

export function ScanSummaryTable({ results }: ScanSummaryTableProps) {
  return (
    <div className="mb-6 backdrop-blur-sm bg-white/30 rounded-xl p-3 shadow-md border border-white/50">
      <h3 className="text-lg font-medium mb-3 text-gray-700 font-montserrat">
        Report Summary
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-black/5">
            <TableRow>
              <TableHead className="font-montserrat">Target</TableHead>
              <TableHead className="font-montserrat">Type</TableHead>
              <TableHead className="font-montserrat">Vulnerabilities</TableHead>
              <TableHead className="font-montserrat">Licenses</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{result.Target || "-"}</TableCell>
                <TableCell>{result.Type || "-"}</TableCell>
                <TableCell>
                  {result.Vulnerabilities ? result.Vulnerabilities.length : "-"}
                </TableCell>
                <TableCell>
                  {result.Licenses ? result.Licenses.length : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        <p>Legend:</p>
        <p>- '-': Not scanned</p>
        <p>- '0': Clean (no security findings detected)</p>
      </div>
    </div>
  );
}
