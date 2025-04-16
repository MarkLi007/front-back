
import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getContractReadOnly, Role } from "@/utils/contract";
import { AuthContext } from "@/contexts/AuthContext";
import { AlertCircle, FileText, Home, Search, Upload, User, Users, Tag, LogOut } from "lucide-react";


export default function Navbar() {
  const location = useLocation();
  const { isConnected, currentAccount, connectWallet } = useAuth();
  const [role, setRole] = useState<Role>(Role.NONE);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { isLoggedIn, nickname, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  // Check if current route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Fetch user role when connected
  useEffect(() => {
    const fetchUserRole = async () => {
      if (isConnected && currentAccount) {
        try {
          const contract = await getContractReadOnly();
          const userRole = await contract.roles(currentAccount);
          setRole(Number(userRole));
          
          // Check if user is the contract owner (admin)
          const owner = await contract.owner();
          setIsAdmin(owner.toLowerCase() === currentAccount.toLowerCase());
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setRole(Role.NONE);
        setIsAdmin(false);
      }
    };
    
    fetchUserRole();
  }, [isConnected, currentAccount]);

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0 ">
            <Link to="/" className="flex items-center text-2xl font-bold text-paper-primary">
              <FileText className="mr-2 h-6 w-6" />
              <span>论文注册</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-1 md:space-x-4">
            <Link to="/" className={`nav-link flex items-center px-2 py-1 rounded-md ${isActive('/') ? 'bg-paper-light text-paper-primary' : 'text-gray-600 hover:text-paper-primary'}`}>
              <Home className="h-4 w-4 mr-1" />
              <span className="text-sm">首页</span>
            </Link>
            
            <Link to="/search" className={`nav-link flex items-center px-2 py-1 rounded-md ${isActive('/search') ? 'bg-paper-light text-paper-primary' : 'text-gray-600 hover:text-paper-primary'}`}>
              <Search className="h-4 w-4 mr-1" />
              <span className="text-sm">检索</span>
            </Link>
            
            {isConnected && (
              <>
                <Link to="/submit" className={`nav-link flex items-center px-2 py-1 rounded-md ${isActive('/submit') ? 'bg-paper-light text-paper-primary' : 'text-gray-600 hover:text-paper-primary'}`}>
                  <Upload className="h-4 w-4 mr-1" />
                  <span className="text-sm">提交</span>
                </Link>
                
                <Link to="/my-papers" className={`nav-link flex items-center px-2 py-1 rounded-md ${isActive('/my-papers') ? 'bg-paper-light text-paper-primary' : 'text-gray-600 hover:text-paper-primary'}`}>
                  <User className="h-4 w-4 mr-1" />
                  <span className="text-sm">我的</span>
                </Link>
                
                <Link to="/nft-marketplace" className={`nav-link flex items-center px-2 py-1 rounded-md ${isActive('/nft-marketplace') ? 'bg-paper-light text-paper-primary' : 'text-gray-600 hover:text-paper-primary'}`}>
                  <Tag className="h-4 w-4 mr-1" />
                  <span className="text-sm">NFT市场</span>
                </Link>
                
                {(isAdmin || role === Role.ADMIN || role === Role.REVIEWER) && (
                  <Link to="/admin" className={`nav-link flex items-center px-2 py-1 rounded-md ${isActive('/admin') ? 'bg-paper-light text-paper-primary' : 'text-gray-600 hover:text-paper-primary'}`}>
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">管理</span>
                  </Link>
                )}
              </>
            )}
            
            {!isLoggedIn ? (
              <Button className="paper-btn-primary text-sm" onClick={connectWallet}>
                <Link to="/auth">连接钱包</Link>
              </Button>
            ) : (
              <Button className="paper-btn-primary text-sm flex items-center">
                <span className="truncate max-w-[80px]">
                  {nickname}
                </span>
                <Button
                  className="ml-2 paper-btn-primary text-sm flex items-center"
                  onClick={() => {
                    logout()
                  }}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  退出
                </Button>
                {(isAdmin || role === Role.ADMIN || role === Role.REVIEWER) && (
                    <Link to="/admin" className={`nav-link flex items-center px-2 py-1 rounded-md ${isActive('/admin') ? 'bg-paper-light text-paper-primary' : 'text-gray-600 hover:text-paper-primary'}`}>
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm">管理</span>
                    </Link>
                  )}
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
