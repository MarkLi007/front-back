
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { getContractReadOnly, getContract } from "@/utils/contract";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Search, Tag, RefreshCw } from "lucide-react";
import NFTCard from "@/components/nft/NFTCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllListedNFTs } from "@/utils/graphql/nftMarket";

// NFT Data type
interface NFTListing {
  paperId: number;
  tokenId: number;
  title: string;
  author: string;
  seller: string;
  price: string;
  ipfsHash: string;
  influence: number;
}

export default function NFTMarketplace() {
  const { isConnected, currentAccount } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userNFTs, setUserNFTs] = useState<NFTListing[]>([]);
  
  // Get all listed NFTs
  const { 
    data: listedNFTs = [],
    refetch: refetchListedNFTs,
    isLoading: isLoadingListedNFTs
  } = useQuery({
    queryKey: ["listedNFTs"],
    queryFn: getAllListedNFTs,
    enabled: isConnected
  });
  
  // Load user owned NFTs separately (both listed and unlisted)
  useEffect(() => {
    const loadUserNFTs = async () => {
      if (!isConnected || !currentAccount) return;
      
      try {
        setIsLoading(true);
        const contract = await getContractReadOnly();
        
        // This is a simplified approach. In a production app,
        // we would use events or indexing to get a user's NFTs more efficiently
        const userNFTsFound = [];
        
        // Loop through a range of paper IDs to find user's NFTs
        // Note: this is inefficient but works for demonstration
        for (let i = 1; i <= 100; i++) {
          try {
            const tokenId = await contract.paperNFT(i);
            if (Number(tokenId) > 0) {
              try {
                const owner = await contract.ownerOf(tokenId);
                if (owner.toLowerCase() === currentAccount.toLowerCase()) {
                  const [paperOwner, title, author, status, versionCount, , , keywords, license] = 
                    await contract.getPaperInfo(i);
                  
                  const price = await contract.nftSalePrice(tokenId);
                  const influence = await contract.calculateInfluence(i);
                  const isListed = Number(price) > 0;
                  
                  // Get the latest version's IPFS hash for display
                  const [ipfsHash] = await contract.getVersion(i, Number(versionCount) - 1);
                  
                  userNFTsFound.push({
                    paperId: i,
                    tokenId: Number(tokenId),
                    title,
                    author,
                    seller: paperOwner,
                    price: ethers.formatEther(price),
                    ipfsHash,
                    influence: Number(influence)
                  });
                }
              } catch (err) {
                console.log(`Error fetching owner for token ${tokenId}:`, err);
              }
            }
          } catch (err) {
            console.log(`Error checking paper ID ${i}:`, err);
          }
        }
        
        setUserNFTs(userNFTsFound);
      } catch (err) {
        console.error("Error loading user NFTs:", err);
        toast({
          title: "加载失败",
          description: "无法加载您拥有的NFT",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserNFTs();
  }, [isConnected, currentAccount]);
  
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      // In a real app, we would filter by keywords here
      await refetchListedNFTs();
      toast({
        title: "搜索完成",
        description: "已更新NFT列表"
      });
    } catch (err) {
      toast({
        title: "搜索失败",
        description: "无法完成搜索请求",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refetchListedNFTs();
      toast({
        title: "刷新成功",
        description: "已更新NFT市场列表"
      });
    } catch (err) {
      toast({
        title: "刷新失败",
        description: "无法刷新NFT市场列表",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">NFT版权市场</h1>
        <p className="text-gray-600 mb-4">
          购买和交易论文版权NFT，支持优质学术成果
        </p>
        
        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <Input 
            placeholder="搜索NFT（按关键词或作者）" 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="flex items-center"
          >
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
        
        {/* Tab Navigation */}
        <Tabs defaultValue="marketplace">
          <TabsList className="mb-6">
            <TabsTrigger value="marketplace">市场列表</TabsTrigger>
            <TabsTrigger value="my-nfts">我的NFT</TabsTrigger>
          </TabsList>
          
          <TabsContent value="marketplace">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <Tag className="mr-2 h-5 w-5 text-paper-primary" />
                市场上架NFT
              </h2>
              <p className="text-sm text-gray-500">
                共 {listedNFTs.length} 个NFT上架中
              </p>
            </div>
            
            {isLoadingListedNFTs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="paper-card animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : listedNFTs.length === 0 ? (
              <div className="paper-card text-center p-8">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg font-medium text-gray-600 mb-2">暂无NFT上架</p>
                <p className="text-gray-500">市场上还没有NFT上架销售</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listedNFTs.map((nft) => (
                  <NFTCard
                    key={`${nft.paperId}-${nft.tokenId}`}
                    nft={nft}
                    currentAccount={currentAccount || ""}
                    onRefresh={refetchListedNFTs}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-nfts">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <Tag className="mr-2 h-5 w-5 text-paper-primary" />
                我的NFT收藏
              </h2>
              <p className="text-sm text-gray-500">
                共 {userNFTs.length} 个NFT
              </p>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="paper-card animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : !isConnected ? (
              <div className="paper-card text-center p-8">
                <p className="text-lg text-gray-600">请连接钱包查看您的NFT</p>
              </div>
            ) : userNFTs.length === 0 ? (
              <div className="paper-card text-center p-8">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg font-medium text-gray-600 mb-2">您还没有NFT</p>
                <p className="text-gray-500">您可以从市场购买NFT或发布论文获取NFT</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userNFTs.map((nft) => (
                  <NFTCard
                    key={`${nft.paperId}-${nft.tokenId}`}
                    nft={nft}
                    currentAccount={currentAccount || ""}
                    onRefresh={() => {
                      // Trigger refresh of both user NFTs and marketplace
                      refetchListedNFTs();
                      // Re-fetch user NFTs (we would need to implement this)
                    }}
                    isOwned={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
