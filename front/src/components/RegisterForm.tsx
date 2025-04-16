
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { register } from "@/utils/auth";
import { Input } from "./ui/input";
import { UserPlus } from "lucide-react";
import { toast } from "../hooks/use-toast";

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export default function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [wallet_address, setWalletAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!username.trim() || !password.trim() || !email.trim()) {
      setErrorMessage({
        title: "输入错误",
        description: "请填写所有必填字段",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage({
        title: "密码不匹配",
        description: "两次输入的密码不一致",
        variant: "destructive"
      });
      return;
    }
    
    
    setIsLoading(true);
    setErrorMessage(null);

    try {
        const result = await register(wallet_address, password);

        if (!result) {
            setErrorMessage("注册失败：未知错误。");
            return;
        }

      toast({
        title: "注册成功",
        description: "欢迎加入论文注册系统",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/");
      }
    } catch (error) {
        console.error('注册失败:', error);
        setErrorMessage('注册失败:' + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setIsLoading(false);
      setWalletAddress('');
      setPassword('');
      setConfirmPassword('');
    }
  }

  return (
    <div className="paper-card max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-paper-primary mb-6">用户注册</h2>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">错误: </strong> {errorMessage}
          </div>
        )}
      
      <form onSubmit={handleSubmit} className="paper-form space-y-4">
        <div className="form-group">
          <label htmlFor="username">用户名 <span className="text-red-500">*</span></label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="请输入用户名"

            disabled={isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">密码 <span className="text-red-500">*</span></label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">确认密码 <span className="text-red-500">*</span></label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入密码"
            disabled={isLoading}
            required
          />
        </div>
        
        <Button
          type="submit"
          className="w-full paper-btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            "注册中..."
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              注册
            </>
          )}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          已有账号？
          <button
            onClick={onLoginClick}
            className="ml-1 text-paper-primary hover:underline"
            disabled={isLoading}
          >
            立即登录
          </button>
        </p>
      </div>
    </div>
  );
}
