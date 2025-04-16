
import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ReportType } from "@/utils/contract";
import { toast } from "@/hooks/use-toast";
import { getContract } from "@/utils/contract";

interface ReportPaperFormProps {
  paperId: number;
}

export default function ReportPaperForm({ paperId }: ReportPaperFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reportType === null) {
      toast({
        title: "请选择举报类型",
        variant: "destructive"
      });
      return;
    }
    
    if (!reason.trim()) {
      toast({
        title: "请输入举报理由",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const contract = await getContract();
      
      const tx = await contract.reportPaper(paperId, reportType, reason);
      
      toast({
        title: "提交中",
        description: "举报已提交，等待确认..."
      });
      
      await tx.wait();
      
      toast({
        title: "举报成功",
        description: "感谢您的举报，管理员将会审核"
      });
      
      setIsOpen(false);
      setReportType(null);
      setReason("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "举报失败",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          举报此论文
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>举报论文</DialogTitle>
          <DialogDescription>
            请详细描述您举报此论文的原因，管理员将进行审核。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">举报类型</label>
            <Select 
              onValueChange={(value) => setReportType(Number(value) as ReportType)} 
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择举报类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={String(ReportType.PLAGIARISM)}>学术抄袭</SelectItem>
                  <SelectItem value={String(ReportType.FALSIFICATION)}>数据造假</SelectItem>
                  <SelectItem value={String(ReportType.COPYRIGHT_VIOLATION)}>版权侵犯</SelectItem>
                  <SelectItem value={String(ReportType.OTHER)}>其他问题</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">举报理由</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请详细描述您发现的问题..."
              rows={4}
              disabled={isSubmitting}
              className="resize-none"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "提交中..." : "提交举报"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
