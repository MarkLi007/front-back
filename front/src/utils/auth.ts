
import { toast } from "../hooks/use-toast";
import { api } from "./api";

export interface User {
  id: string;
  username: string;
  role: string;
}

export async function login(username: string, password: string): Promise<{token: string, role: string}> {
  try {
    const response = await fetch("http://localhost:3002/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }
    
    // Save the token to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("userRole", data.role);
    
    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function register(username: string, password: string, email: string): Promise<{token: string, role: string}> {
  try {
    const response = await fetch("http://localhost:3002/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }
    
    // Save the token to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("userRole", data.role);
    
    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  window.location.href = "/";
}

export async function login(wallet_address: string, password?: string): Promise<any> {
  try {
    const response = await api.post("/user/login", {
      wallet_address,
      password
    });
    if(response.token){
      localStorage.setItem("token", response.token);
    }
    
    return response;
  } catch (error:any) {
    throw new Error(error.message || "Login failed");
  }
}

export async function register(wallet_address: string, password?: string): Promise<any> {
  try {
    const response = await api.post("/user/register", {
      wallet_address,
      password,
    });

    if(response.token){
      localStorage.setItem("token", response.token);
    }
    return response;
  } catch (error:any) {
    throw new Error(error.message || "Registration failed");
  }
}

export async function getNickname(wallet_address: string): Promise<any> {
  try {
    const response = await api.get(`/user/nickname/${wallet_address}`);
    return response;
  } catch (error:any) {
    throw new Error(error.message || "get nickname failed");
  }
}
export async function setNickname(wallet_address: string, nickname:string): Promise<any> {
  const response = await api.post("/user/nickname",{wallet_address,nickname});
  return response;
}


export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getUserRole(): string | null {
  return localStorage.getItem("userRole");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function useAuthGuard(): boolean {
  if (!isAuthenticated()) {
    toast({
      title: "未登录",
      description: "请先登录后再访问此页面",
      variant: "destructive"
    });
    return false;
  }
  return true;
}
