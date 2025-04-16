import React, { useState, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AuthContext } from "../contexts/AuthContext";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { isLoggedIn } = useContext(AuthContext);
  
    const navigate = useNavigate();
  // Redirect if already authenticated
  if (isLoggedIn) {
      navigate("/");
      return null
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Tabs defaultValue="login" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm onRegisterClick={() => setActiveTab("register")} />
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm onLoginClick={() => setActiveTab("login")} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
