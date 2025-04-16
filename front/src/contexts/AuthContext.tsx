
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getContract, getContractReadOnly, Role } from "../utils/contract";
import { toast } from "../hooks/use-toast";
import { getToken, isLoggedIn, getNickname, setNickname } from "../utils/auth";

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  walletAddress: string;
  nickname: string | null;
  isOwner: boolean;
  isAuditor: boolean;
  userRole: Role;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  checkRole: () => Promise<void>;
  login: (walletAddress: string) => void;
  logout: () => void;
  refreshLoginStatus:() => void;
  updateNickname: (nickname: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  token: null,
  walletAddress: "",
  nickname: null,
  isOwner: false,
  isAuditor: false,
  userRole: Role.NONE,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  checkRole: async () => {},
  login: (walletAddress: string) => {},
  logout: () => {},
  refreshLoginStatus: () => {},
  updateNickname: (nickname: string) => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isAuditor, setIsAuditor] = useState(false);
  const [userRole, setUserRole] = useState<Role>(Role.NONE);

  const [token, setToken] = useState<string | null>(getToken());
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [nickname, setNicknameState] = useState<string | null>(null);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
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
          setWalletAddress(accounts[0]);
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
      setWalletAddress(accounts[0]);
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
    setWalletAddress("");
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
      setIsOwner(owner.toLowerCase() === walletAddress.toLowerCase());

      // Check if user is an auditor (legacy contract support)
      const auditor = await contract.auditors(walletAddress);
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

  const refreshLoginStatus = useCallback(() => {
    const loggedIn = isLoggedIn();
    setToken(getToken());
    setIsLoggedIn(loggedIn);
  }, []);
  
  useEffect(() => {
    refreshLoginStatus();
  }, [refreshLoginStatus]);

  const login = (walletAddress:string) => {
    setWalletAddress(walletAddress)
    const newToken = getToken();
    setToken(newToken);
    setIsLoggedIn(true);
    // 获取昵称
    getNickname(walletAddress).then((nickname) => {
        setNicknameState(nickname);
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsLoggedIn(false);
    setNicknameState(null)
  };

  const updateNickname = (newNickname: string) => {
    setNicknameState(newNickname);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        token,
        walletAddress,
        nickname,
        isOwner,
        isAuditor,
        userRole,
        connectWallet,
        login,
        disconnectWallet,
        checkRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
