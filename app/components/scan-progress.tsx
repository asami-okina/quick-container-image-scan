"use client";

import { Loader2 } from "lucide-react";

interface ScanProgressProps {
  logs: { message: string; createdAt: Date }[];
  isScanning: boolean;
  currentTime: string;
}

export default function ScanProgress({
  logs,
  isScanning,
  currentTime,
}: ScanProgressProps) {
  return (
    <div className="glass-card p-6">
      <div className="pb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium flex items-center gap-2 bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent font-montserrat">
          <span className="w-4 h-4 flex items-center justify-center">
            <Loader2
              className={`h-4 w-4 text-pink-500 transition-opacity duration-300 ${
                isScanning ? "opacity-100 animate-spin" : "opacity-0"
              }`}
            />
          </span>
          <span>Scan Progress</span>
        </h2>
      </div>
      <div className="bg-black/5 backdrop-blur-sm p-4 rounded-xl h-[200px] overflow-y-auto font-mono text-sm">
        {logs.map((log, index) => (
          <div key={index} className="py-1">
            <span className="text-pink-500">
              [{log.createdAt.toLocaleTimeString()}]
            </span>{" "}
            <span className="text-gray-700">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
