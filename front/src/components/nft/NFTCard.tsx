
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Tag, DollarSign, X } from "lucide-react";

// NFT card props interface
interface NFTCardProps {
  nft: {
    paperId: number;
    tokenId: number;
    title: string;
    author: string;
    seller: string;
    price: string;
    ipfsHash: string;
    influence: number;
  };
  currentAccount: string;
  onRefresh: () => void;
  isOwned?: boolean;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, currentAccount, onRefresh, isOwned = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  
  // Format addresses for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Check if current user is the NFT owner
  const isOwner = nft.seller.toLowerCase() === currentAccount.toLowerCase();
  const isListed = parseFloat(nft.price) > 0;
  
  // Get IPFS gateway URL for preview
  const getIPFSUrl = (ipfsHash: string) => {
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  };
  
  // Handle NFT purchase
  const handleBuyNFT = async () => {
    if (!currentAccount) {
      toast({
        title: "未连接钱包",
        description: "请先连接钱包",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const contract = await getContract();
      
      const tx = await contract.buyNFT(nft.paperId, {
        value: ethers.parseEther(nft.price)
      });
      
      toast({
        title: "交易提交中",
        description: "NFT购买请求已提交，等待区块链确认..."
      });
      
      await tx.wait();
      
      toast({
        title: "购买成功",
        description: "您已成功购买该NFT！",
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      toast({
        title: "购买失败",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle NFT listing
  const handleListNFT = async () => {
    if (!priceInput || isNaN(parseFloat(priceInput)) || parseFloat(priceInput) <= 0) {
      toast({
        title: "价格无效",
        description: "请输入有效的价格",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const contract = await getContract();
      
      const priceInWei = ethers.parseEther(priceInput);
      const tx = await contract.listNFT(nft.paperId, priceInWei);
      
      toast({
        title: "上架中",
        description: "NFT上架请求已提交，等待区块链确认..."
      });
      
      await tx.wait();
      
      toast({
        title: "上架成功",
        description: `NFT已成功上架，价格: ${priceInput} ETH`
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
  
  // Handle cancelling NFT listing
  const handleCancelListing = async () => {
    try {
      setIsLoading(true);
      const contract = await getContract();
      
      const tx = await contract.cancelNFTListing(nft.paperId);
      
      toast({
        title: "取消上架中",
        description: "取消上架请求已提交，等待区块链确认..."
      });
      
      await tx.wait();
      
      toast({
        title: "取消成功",
        description: "NFT已成功下架"
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error cancelling listing:", error);
      toast({
        title: "取消失败",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="paper-card overflow-hidden hover:shadow-lg transition-shadow">
      {/* NFT Preview (Either PDF preview or placeholder) */}
      <div className="relative bg-gray-100 h-48 rounded-md flex items-center justify-center mb-3 overflow-hidden">
        {nft.ipfsHash ? (
          <iframe 
            src={getIPFSUrl(nft.ipfsHash)} 
            className="w-full h-full" 
            title={nft.title}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Tag className="h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">预览不可用</p>
            </div>
          </iframe>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Tag className="h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">预览不可用</p>
          </div>
        )}
      </div>
      
      {/* NFT Info */}
      <div className="mb-4">
        <Link to={`/paper/${nft.paperId}`} className="hover:underline">
          <h3 className="text-lg font-medium line-clamp-2 text-paper-primary mb-1">
            {nft.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-1">作者: {nft.author}</p>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Token ID: #{nft.tokenId}</p>
          <div className="flex items-center text-sm text-paper-secondary">
            <span className="font-medium">影响力: {nft.influence}</span>
          </div>
        </div>
      </div>
      
      {/* Price & Actions */}
      {isListed && (
        <div className="mb-3">
          <div className="flex items-center text-green-600 font-medium">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>{nft.price} ETH</span>
          </div>
          <p className="text-xs text-gray-500">
            出售者: {formatAddress(nft.seller)}
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="mt-auto">
        {isOwner && isOwned ? (
          // Owner controls
          !isListed ? (
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
                size="sm"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                上架
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleCancelListing}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              取消上架
            </Button>
          )
        ) : (
          // Buyer controls - only show if NFT is listed and user is not the owner
          isListed && !isOwner && (
            <Button
              onClick={handleBuyNFT}
              className="w-full"
              disabled={isLoading}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              购买
            </Button>
          )
        )}
        
        {/* Link to paper details */}
        {!isOwned && (
          <Link to={`/paper/${nft.paperId}`} className="block mt-2 text-center text-sm text-paper-primary hover:underline">
            查看论文详情
          </Link>
        )}
      </div>
    </div>
  );
};

export default NFTCard;
