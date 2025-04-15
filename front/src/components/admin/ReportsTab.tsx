
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportCard } from "./ReportCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ReportType } from "@/utils/contract";
import { getPaperReports } from "@/utils/graphql/adminReports";

interface ReportsTabProps {
  onProcessReport: (paperId: number, reportIndex: number, isValid: boolean) => Promise<boolean>;
  processingReportIds: Set<string>; // Track which reports are being processed
}

export default function ReportsTab({ onProcessReport, processingReportIds }: ReportsTabProps) {
  const {
    data: reports = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["paperReports"],
    queryFn: getPaperReports
  });

  // Handler for processing report
  const handleProcess = async (paperId: number, reportIndex: number, isValid: boolean) => {
    const success = await onProcessReport(paperId, reportIndex, isValid);
    if (success) {
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="paper-card p-6 text-center">
        <p className="text-gray-500">正在加载举报信息...</p>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="paper-card p-6">
        <div className="text-center">
          <p className="mb-4 text-lg font-medium">暂无未处理的举报</p>
          <Button 
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新数据
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-xl font-semibold">论文举报</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <ReportCard
            key={`${report.paperId}-${report.reportIndex}`}
            paperId={report.paperId}
            reportIndex={report.reportIndex}
            reportType={report.reportType}
            reason={report.reason}
            reporter={report.reporter}
            timestamp={report.timestamp}
            processed={report.processed}
            valid={report.valid}
            isProcessing={processingReportIds.has(`${report.paperId}-${report.reportIndex}`)}
            onProcess={(isValid) => handleProcess(report.paperId, report.reportIndex, isValid)}
          />
        ))}
      </div>
    </div>
  );
}
