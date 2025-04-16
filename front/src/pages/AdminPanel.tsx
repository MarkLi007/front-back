
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { getPendingPapers } from "../utils/graphql/adminPapers";
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Role, ReportType } from "../utils/contract";

// Custom components
import AdminHeader from "../components/admin/AdminHeader";
import PendingPapersTab from "../components/admin/PendingPapersTab";
import AuditorsManagementTab from "../components/admin/AuditorsManagementTab";
import ReviewersListTab from "../components/admin/ReviewersListTab";
import AuthRequiredMessage from "../components/admin/AuthRequiredMessage";
import ReportsTab from "../components/admin/ReportsTab";
import { useAdminActions } from "../hooks/useAdminActions";
import { toast } from "@/hooks/use-toast";
import { getContract } from "@/utils/contract";

export default function AdminPanel() {
  const { currentAccount, isConnected, connectWallet, isOwner, isAuditor, userRole, checkRole } = useAuth();
  const [processingReportIds, setProcessingReportIds] = useState<Set<string>>(new Set());
  
  const {
    newAuditorAddr,
    setNewAuditorAddr,
    isAddingAuditor,
    isRemovingAuditor,
    currentActionPaperId,
    handleAddAuditor,
    handleRemoveAuditor,
    handleApprovePaper,
    handleRejectPaper
  } = useAdminActions(checkRole);

  // Use React Query to fetch pending papers
  const { 
    data: pendingPapers = [], 
    isLoading: isLoadingPapers, 
    refetch: loadPendingPapers 
  } = useQuery({
    queryKey: ['pendingPapers'],
    queryFn: getPendingPapers,
    enabled: isConnected && (isOwner || isAuditor || userRole === Role.ADMIN || userRole === Role.REVIEWER),
  });

  // Handle paper approval with refetching
  const handleApprove = async (paperId: number) => {
    const success = await handleApprovePaper(paperId);
    if (success) loadPendingPapers();
  };

  // Handle paper rejection with refetching
  const handleReject = async (paperId: number) => {
    const success = await handleRejectPaper(paperId);
    if (success) loadPendingPapers();
  };

  // Handle report processing
  const handleProcessReport = async (paperId: number, reportIndex: number, isValid: boolean) => {
    const reportId = `${paperId}-${reportIndex}`;
    
    try {
      setProcessingReportIds(prev => new Set([...prev, reportId]));
      
      const contract = await getContract();
      
      toast({
        title: "处理中",
        description: `正在处理举报 #${reportIndex+1} (论文 #${paperId})`,
      });
      
      const tx = await contract.processReport(paperId, reportIndex, isValid);
      await tx.wait();
      
      toast({
        title: "处理成功",
        description: isValid ? "举报已确认有效，论文已被处理" : "举报已标记为无效",
      });
      
      return true;
    } catch (error) {
      console.error("Error processing report:", error);
      toast({
        title: "处理失败",
        description: (error as Error).message,
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessingReportIds(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  // Force a role check when the component mounts
  useEffect(() => {
    if (isConnected) {
      checkRole();
      console.log("AdminPanel: Checking role for", currentAccount);
      console.log("AdminPanel: isOwner:", isOwner, "isAuditor:", isAuditor, "userRole:", userRole);
    }
  }, [isConnected, currentAccount]);

  // Check if user has admin access via either old or new contract
  const hasAdminAccess = isOwner || isAuditor || userRole === Role.ADMIN || userRole === Role.REVIEWER;

  if (!isConnected) {
    return (
      <Layout>
        <AuthRequiredMessage type="connect" onConnect={connectWallet} />
      </Layout>
    );
  }

  if (!hasAdminAccess) {
    return (
      <Layout>
        <AuthRequiredMessage 
          type="unauthorized" 
          isOwner={isOwner} 
          isAuditor={isAuditor}
          currentAccount={currentAccount}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-paper-primary mb-6">管理面板</h1>
        
        <AdminHeader 
          currentAccount={currentAccount}
          isOwner={isOwner}
          isAuditor={isAuditor}
          userRole={userRole}
        />
        
        <Tabs defaultValue="pending">
          <TabsList className="w-full">
            <TabsTrigger value="pending">待审核论文</TabsTrigger>
            <TabsTrigger value="reviewers">审稿人列表</TabsTrigger>
            <TabsTrigger value="reports">举报处理</TabsTrigger>
            {(isOwner || userRole === Role.ADMIN) && <TabsTrigger value="auditors">审稿人管理</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            <PendingPapersTab
              pendingPapers={pendingPapers}
              isLoadingPapers={isLoadingPapers}
              currentActionPaperId={currentActionPaperId}
              onRefresh={loadPendingPapers}
              onApprovePaper={handleApprove}
              onRejectPaper={handleReject}
            />
          </TabsContent>
          
          <TabsContent value="reviewers" className="mt-6">
            <ReviewersListTab />
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6">
            <ReportsTab 
              onProcessReport={handleProcessReport}
              processingReportIds={processingReportIds}
            />
          </TabsContent>
          
          {(isOwner || userRole === Role.ADMIN) && (
            <TabsContent value="auditors" className="mt-6">
              <AuditorsManagementTab
                newAuditorAddr={newAuditorAddr}
                isAddingAuditor={isAddingAuditor}
                isRemovingAuditor={isRemovingAuditor}
                onAddressChange={setNewAuditorAddr}
                onAddAuditor={handleAddAuditor}
                onRemoveAuditor={handleRemoveAuditor}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
