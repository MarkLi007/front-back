
import React from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportType } from "@/utils/contract";

interface ReportCardProps {
  paperId: number;
  reportIndex: number;
  reportType: ReportType;
  reason: string;
  reporter: string;
  timestamp: number;
  processed: boolean;
  valid: boolean;
  onProcess: (valid: boolean) => void;
  isProcessing: boolean;
}

export function ReportCard({
  paperId,
  reportIndex,
  reportType,
  reason,
  reporter,
  timestamp,
  processed,
  valid,
  onProcess,
  isProcessing
}: ReportCardProps) {
  
  function getReportTypeString(type: ReportType): string {
    switch (type) {
      case ReportType.PLAGIARISM:
        return "学术抄袭";
      case ReportType.FALSIFICATION:
        return "数据造假";
      case ReportType.COPYRIGHT_VIOLATION:
        return "版权侵犯";
      default:
        return "其他问题";
    }
  }

  function getReportTypeColor(type: ReportType): string {
    switch (type) {
      case ReportType.PLAGIARISM:
        return "bg-red-100 text-red-800";
      case ReportType.FALSIFICATION:
        return "bg-yellow-100 text-yellow-800";
      case ReportType.COPYRIGHT_VIOLATION:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  return (
    <div className="paper-card">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
          <h4 className="font-medium">举报 #{reportIndex+1}</h4>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(reportType)}`}>
          {getReportTypeString(reportType)}
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        <p className="text-sm">{reason}</p>
        
        <div className="text-xs text-gray-500">
          <p>举报者: {reporter.slice(0, 6)}...{reporter.slice(-4)}</p>
          <p>时间: {new Date(timestamp * 1000).toLocaleString()}</p>
        </div>
      </div>
      
      {processed ? (
        <div className="mt-3 border-t pt-3">
          <div className={`flex items-center ${valid ? 'text-red-600' : 'text-green-600'}`}>
            {valid ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">该举报有效，论文已被处理</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">该举报无效，已驳回</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 border-t pt-3 flex space-x-2">
          <Button 
            onClick={() => onProcess(true)} 
            size="sm" 
            variant="destructive" 
            disabled={isProcessing}
          >
            {isProcessing ? "处理中..." : "确认有效"}
          </Button>
          <Button 
            onClick={() => onProcess(false)} 
            size="sm" 
            variant="outline" 
            disabled={isProcessing}
          >
            {isProcessing ? "处理中..." : "标记无效"}
          </Button>
        </div>
      )}
    </div>
  );
}
