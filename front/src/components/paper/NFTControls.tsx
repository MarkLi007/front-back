
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tag, DollarSign, ShoppingCart, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";

interface NFTControlsProps {
  paperId: number;
  paperOwner: string;
  currentAccount: string;
  onRefresh: () => void;
}

export default function NFTControls({ 
  paperId, 
  paperOwner,
  currentAccount,
  onRefresh 
}: NFTControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [nftInfo, setNftInfo] = useState<{
    tokenId: number;
    price: string;
    isForSale: boolean;
    owner: string;
    influence: number;
  } | null>(null);
  const [priceInput, setPriceInput] = useState("");
  
  const isOwner = paperOwner.toLowerCase() === currentAccount.toLowerCase();
  
  // Load NFT status
  useEffect(() => {
    const loadNFTInfo = async () => {
      try {
        const contract = await getContract();
        const tokenId = await contract.paperNFT(paperId);
        
        if (Number(tokenId) === 0) {
          // No NFT minted yet
          setNftInfo(null);
          return;
        }
        
        // Get price if listed
        const price = await contract.nftSalePrice(tokenId);
        const owner = await contract.ownerOf(tokenId);
        const influence = await contract.calculateInfluence(paperId);
        
        setNftInfo({
          tokenId: Number(tokenId),
          price: ethers.formatEther(price),
          isForSale: Number(price) > 0,
          owner,
          influence: Number(influence)
        });
      } catch (error) {
        console.error("Error loading NFT info:", error);
      }
    };
    
    loadNFTInfo();
  }, [paperId, currentAccount]);
  
  const handleListNFT = async () => {
    try {
      if (!priceInput || isNaN(Number(priceInput)) || Number(priceInput) <= 0) {
        toast({
          title: "价格错误",
          description: "请输入有效的价格",
          variant: "destructive"
        });
        return;
      }
      
      setIsLoading(true);
      const contract = await getContract();
      
      const priceInWei = ethers.parseEther(priceInput);
      const tx = await contract.listNFT(paperId, priceInWei);
      
      toast({
        title: "提交中",
        description: "NFT上架交易已提交，等待确认..."
      });
      
      await tx.wait();
      
      toast({
        title: "上架成功",
        description: `论文版权NFT已成功上架，价格: ${priceInput} ETH`
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error listing NFT:", error);
      toast({
        title: "上架失败",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelListing = async () => {
    try {
      setIsLoading(true);
      const contract = await getContract();
      
      const tx = await contract.cancelNFTListing(paperId);
      
      toast({
        title: "提交中",
        description: "取消上架交易已提交，等待确认..."
      });
      
      await tx.wait();
      
      toast({
        title: "取消成功",
        description: "NFT已成功下架"
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error cancelling NFT listing:", error);
      toast({
        title: "取消失败",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBuyNFT = async () => {
    if (!nftInfo || !nftInfo.isForSale) return;
    
    try {
      setIsLoading(true);
      const contract = await getContract();
      
      const tx = await contract.buyNFT(paperId, {
        value: ethers.parseEther(nftInfo.price)
      });
      
      toast({
        title: "提交中",
        description: "购买NFT交易已提交，等待确认..."
      });
      
      await tx.wait();
      
      toast({
        title: "购买成功",
        description: `恭喜！您已成功购买论文版权NFT`
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error buying NFT:", error);
      toast({
        title: "购买失败",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // If no NFT has been minted yet
  if (!nftInfo) {
    return null;
  }
  
  return (
    <div className="border rounded-lg p-4 mb-6 bg-gradient-to-r from-indigo-50 to-blue-50">
      <div className="flex items-center mb-3">
        <Tag className="h-5 w-5 mr-2 text-indigo-600" />
        <h3 className="text-lg font-medium text-indigo-900">NFT版权凭证</h3>
      </div>
      
      <div className="mb-4 text-sm text-gray-600">
        <p>Token ID: #{nftInfo.tokenId}</p>
        <p>当前持有者: {nftInfo.owner.slice(0, 8)}...{nftInfo.owner.slice(-6)}</p>
        <p>影响力指数: {nftInfo.influence}</p>
        {nftInfo.isForSale && (
          <p className="font-medium text-green-600 mt-1">
            售价: {nftInfo.price} ETH
          </p>
        )}
      </div>
      
      {/* Owner controls */}
      {nftInfo.owner.toLowerCase() === currentAccount.toLowerCase() && (
        <div className="space-y-3">
          {!nftInfo.isForSale ? (
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="价格 (ETH)"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                min="0.0001"
                step="0.0001"
                className="flex-1"
              />
              <Button 
                onClick={handleListNFT}
                disabled={isLoading}
                className="flex items-center"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                上架出售
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleCancelListing}
              variant="outline"
              className="w-full flex items-center"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              取消上架
            </Button>
          )}
        </div>
      )}
      
      {/* Buy controls (for non-owners) */}
      {nftInfo.isForSale && nftInfo.owner.toLowerCase() !== currentAccount.toLowerCase() && (
        <Button
          onClick={handleBuyNFT}
          variant="default"
          className="w-full flex items-center"
          disabled={isLoading}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          购买 ({nftInfo.price} ETH)
        </Button>
      )}
      
      {/* Link to NFT marketplace */}
      <div className="mt-3 text-center">
        <Link to="/nft-marketplace" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center">
          <ExternalLink className="h-3 w-3 mr-1" />
          前往NFT市场探索更多
        </Link>
      </div>
    </div>
  );
}
