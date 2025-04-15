
import React from "react";
import { User } from "lucide-react";
import { mapRoleToString, Role } from "../../utils/contract";

interface AdminHeaderProps {
  currentAccount: string;
  isOwner: boolean;
  isAuditor: boolean;
  userRole?: Role;  // New prop for user's role from refactored contract
}

export default function AdminHeader({ currentAccount, isOwner, isAuditor, userRole }: AdminHeaderProps) {
  return (
    <div className="mb-4 paper-card">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-full bg-paper-light text-paper-primary mr-3">
          <User className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">当前钱包地址</p>
          <p className="font-medium">{currentAccount}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {isOwner && (
          <div className="bg-paper-light text-paper-primary px-3 py-1 rounded-full text-sm">
            合约所有者
          </div>
        )}
        {isAuditor && (
          <div className="bg-paper-light text-paper-primary px-3 py-1 rounded-full text-sm">
            审稿人
          </div>
        )}
        {userRole !== undefined && userRole !== Role.NONE && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {mapRoleToString(userRole)}
          </div>
        )}
      </div>
    </div>
  );
}
