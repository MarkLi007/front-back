
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { toast } from "../hooks/use-toast";
import { Role, mapRoleToString } from "../utils/contract";
import { PenLine, Save, User, FileText, Award, Medal } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Define user profile type
interface UserProfile {
  nickname: string;
  bio: string;
  avatarUrl: string;
  interests: string[];
}

export default function UserProfile() {
  const { isConnected, currentAccount, userRole } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is connected
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
      toast({
        title: "请先连接钱包",
        description: "需要先连接钱包才能访问个人主页",
        variant: "destructive"
      });
    }
  }, [isConnected, navigate]);

  // Load profile from localStorage or set defaults
  const loadProfileFromStorage = (): UserProfile => {
    if (!currentAccount) return defaultProfile;
    
    const savedProfile = localStorage.getItem(`profile_${currentAccount}`);
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    return defaultProfile;
  };

  // Default profile
  const defaultProfile: UserProfile = {
    nickname: "",
    bio: "",
    avatarUrl: "",
    interests: []
  };

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  
  // Load profile when account changes
  useEffect(() => {
    if (currentAccount) {
      setProfile(loadProfileFromStorage());
    }
  }, [currentAccount]);

  // Save profile to localStorage
  const saveProfile = () => {
    if (!currentAccount) return;
    
    localStorage.setItem(`profile_${currentAccount}`, JSON.stringify(profile));
    setIsEditing(false);
    toast({
      title: "保存成功",
      description: "你的个人资料已更新"
    });
  };

  // Add a new interest
  const addInterest = () => {
    if (!newInterest.trim()) return;
    
    if (profile.interests.includes(newInterest.trim())) {
      toast({
        title: "添加失败",
        description: "该兴趣标签已存在",
        variant: "destructive"
      });
      return;
    }
    
    setProfile({
      ...profile,
      interests: [...profile.interests, newInterest.trim()]
    });
    setNewInterest("");
  };

  // Remove an interest
  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter(i => i !== interest)
    });
  };

  // Generate avatar fallback initials
  const getAvatarInitials = () => {
    if (profile.nickname) {
      return profile.nickname.substring(0, 2).toUpperCase();
    }
    return currentAccount ? currentAccount.substring(0, 2).toUpperCase() : "U";
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-paper-primary">个人主页</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    {profile.avatarUrl ? (
                      <AvatarImage src={profile.avatarUrl} alt={profile.nickname || "用户头像"} />
                    ) : null}
                    <AvatarFallback className="text-2xl bg-paper-primary text-white">
                      {getAvatarInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{profile.nickname || "未设置昵称"}</CardTitle>
                <CardDescription className="break-all">
                  <span className="font-mono text-xs">
                    {currentAccount}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge className="mb-2 bg-paper-primary">{mapRoleToString(userRole || 0)}</Badge>
                {profile.bio && <p className="mt-4 text-gray-600">{profile.bio}</p>}
              </CardContent>
              <CardFooter className="justify-center">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <Save className="mr-2 h-4 w-4" /> : <PenLine className="mr-2 h-4 w-4" />}
                  {isEditing ? "完成编辑" : "编辑个人资料"}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Edit Profile / Profile Details */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  {isEditing ? "编辑个人资料" : "个人资料"}
                </CardTitle>
                <CardDescription>
                  {isEditing 
                    ? "自定义你的个人信息，让其他用户更了解你" 
                    : "查看你的个人信息"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  // Edit Mode
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="nickname">昵称</Label>
                      <Input 
                        id="nickname" 
                        value={profile.nickname} 
                        placeholder="输入你的昵称"
                        onChange={e => setProfile({...profile, nickname: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="avatarUrl">头像链接</Label>
                      <Input 
                        id="avatarUrl" 
                        value={profile.avatarUrl} 
                        placeholder="输入头像图片URL"
                        onChange={e => setProfile({...profile, avatarUrl: e.target.value})}
                      />
                      <p className="text-xs text-gray-500">链接格式: https://example.com/image.jpg</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">个人简介</Label>
                      <Textarea 
                        id="bio" 
                        value={profile.bio} 
                        placeholder="介绍一下自己吧"
                        onChange={e => setProfile({...profile, bio: e.target.value})}
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="interests">兴趣标签</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="interests"
                          value={newInterest}
                          placeholder="添加兴趣标签" 
                          onChange={e => setNewInterest(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && addInterest()}
                        />
                        <Button type="button" onClick={addInterest}>添加</Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.interests.map(interest => (
                          <Badge key={interest} variant="outline" className="group">
                            {interest}
                            <button 
                              className="ml-1 rounded-full opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                              onClick={() => removeInterest(interest)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button onClick={saveProfile} className="w-full mt-4">
                      <Save className="mr-2 h-4 w-4" />
                      保存个人资料
                    </Button>
                  </>
                ) : (
                  // View Mode
                  <>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">昵称</h3>
                        <p>{profile.nickname || "未设置"}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">个人简介</h3>
                        <p className="whitespace-pre-line">{profile.bio || "未设置"}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">兴趣标签</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.interests.length > 0 ? (
                            profile.interests.map(interest => (
                              <Badge key={interest}>{interest}</Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400">未设置任何兴趣标签</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Academic Achievements Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  学术成就
                </CardTitle>
                <CardDescription>
                  你在本平台发表的论文和获得的成就
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-paper-primary" />
                    <span>已发表论文</span>
                  </div>
                  <Badge variant="outline">点击查看</Badge>
                </div>
                
                <div className="flex items-center justify-between border-b py-4">
                  <div className="flex items-center">
                    <Medal className="h-5 w-5 mr-2 text-paper-primary" />
                    <span>学术成就</span>
                  </div>
                  <Badge variant="outline">查看详情</Badge>
                </div>
                
                <div className="pt-4 text-center">
                  <Button variant="outline" asChild>
                    <a href="/my-papers">查看我的论文</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
