
import React, { useState, useEffect } from "react";
import { getContractReadOnly, Role, mapRoleToString } from "@/utils/contract";
import { Users, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { ethers } from "ethers";

// Event type for the RoleAssigned event
interface RoleEvent {
  user: string;
  role: number;
  blockNumber: number;
}

export default function ReviewersListTab() {
  const [reviewers, setReviewers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopyingAddress, setCopyingAddress] = useState<string | null>(null);

  // Function to fetch reviewers from events
  const fetchReviewers = async () => {
    setIsLoading(true);
    try {
      const contract = await getContractReadOnly();
      
      // Get events for role assignment (to Role.REVIEWER)
      const filter = contract.filters.RoleAssigned(null, Role.REVIEWER);
      const events = await contract.queryFilter(filter, 0, "latest");
      
      // Map to addresses and remove duplicates
      const reviewerAddresses = [...new Set(
        events.map(event => {
          // For ethers v6, we need to parse the event log differently
          let user = "";
          let role = 0;
          
          // Check if this is an ethers v6 EventLog (has decode method)
          if ('args' in event) {
            // This is an EventLog with parsed args
            user = event.args[0] || "";
            role = Number(event.args[1] || 0);
          } else {
            // This is a raw Log, we need to decode it manually
            // Get the event fragment for RoleAssigned
            const iface = new ethers.Interface([
              "event RoleAssigned(address indexed user, uint8 indexed role)"
            ]);
            // Try to decode the log
            try {
              const decodedLog = iface.parseLog({
                topics: event.topics,
                data: event.data
              });
              if (decodedLog) {
                user = decodedLog.args[0] || "";
                role = Number(decodedLog.args[1] || 0);
              }
            } catch (e) {
              console.error("Failed to decode log:", e);
            }
          }
          
          return {
            user,
            role,
            blockNumber: event.blockNumber
          };
        })
        .filter(event => event.role === Role.REVIEWER && event.user)
        .sort((a, b) => b.blockNumber - a.blockNumber) // Sort by block number descending
        .map(event => event.user)
      )];
      
      // Filter to ensure they still have the REVIEWER role
      const validatedReviewers = [];
      for (const address of reviewerAddresses) {
        const role = await contract.roles(address);
        if (Number(role) === Role.REVIEWER) {
          validatedReviewers.push(address);
        }
      }
      
      setReviewers(validatedReviewers);
    } catch (error) {
      console.error("Error fetching reviewers:", error);
      toast({
        title: "获取审稿人失败",
        description: "无法加载审稿人列表，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewers();
  }, []);

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopyingAddress(address);
      toast({
        title: "复制成功",
        description: "地址已复制到剪贴板"
      });
      setTimeout(() => setCopyingAddress(null), 1500);
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制地址",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="paper-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-paper-primary flex items-center">
          <Users className="mr-2 h-5 w-5" />
          审稿人列表
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchReviewers}
          disabled={isLoading}
        >
          刷新
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : reviewers.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>序号</TableHead>
                <TableHead>审稿人地址</TableHead>
                <TableHead>角色</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewers.map((address, index) => (
                <TableRow key={address}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-mono">
                    {address.substring(0, 6)}...{address.substring(address.length - 4)}
                  </TableCell>
                  <TableCell>{mapRoleToString(Role.REVIEWER)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(address)}
                    >
                      {isCopyingAddress === address ? "已复制" : "复制地址"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">暂无审稿人</p>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
        <p>
          <strong>说明：</strong> 此列表显示所有具有审稿人角色的地址。管理员可以通过上方的"审稿人管理"选项添加或移除审稿人。
        </p>
      </div>
    </div>
  );
}
