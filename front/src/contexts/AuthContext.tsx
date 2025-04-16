
import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract, getContractReadOnly, Role } from "../utils/contract";
import { toast } from "../hooks/use-toast";

interface AuthContextType {
  isConnected: boolean;
  currentAccount: string;
  isOwner: boolean;
  isAuditor: boolean;
  userRole: Role;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  checkRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isConnected: false,
  currentAccount: "",
  isOwner: false,
  isAuditor: false,
  userRole: Role.NONE,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  checkRole: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isAuditor, setIsAuditor] = useState(false);
  const [userRole, setUserRole] = useState<Role>(Role.NONE);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
            setIsConnected(true);
            checkRole();
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          setIsConnected(true);
          checkRole();
        } else {
          disconnectWallet();
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask未安装",
        description: "请先安装MetaMask钱包扩展",
        variant: "destructive"
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      setIsConnected(true);
      checkRole();
      
      toast({
        title: "连接成功",
        description: "已成功连接到钱包"
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "连接失败",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const disconnectWallet = () => {
    setCurrentAccount("");
    setIsConnected(false);
    setIsOwner(false);
    setIsAuditor(false);
    setUserRole(Role.NONE);
  };

  const checkRole = async () => {
    if (!isConnected) return;

    try {
      const contract = await getContractReadOnly();

      // Check if user is the contract owner
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === currentAccount.toLowerCase());

      // Check if user is an auditor (legacy contract support)
      const auditor = await contract.auditors(currentAccount);
      setIsAuditor(auditor);

      // Check the role from the new contract
      try {
        const role = await contract.roles(currentAccount);
        setUserRole(Number(role));
      } catch (error) {
        console.error("Failed to get user role:", error);
        setUserRole(Role.NONE);
      }
    } catch (error) {
      console.error("Failed to check role:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isConnected,
        currentAccount,
        isOwner,
        isAuditor,
        userRole,
        connectWallet,
        disconnectWallet,
        checkRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
