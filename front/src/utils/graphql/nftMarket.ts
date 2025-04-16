
import { gql } from '@apollo/client';
import { client } from './client';
import { ethers } from 'ethers';
import { getContractReadOnly } from '../contract';

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

// Fetch all listed NFTs from the contract
export async function getAllListedNFTs(): Promise<NFTListing[]> {
  try {
    // In a production environment, this would be refactored to use TheGraph
    // For now, we'll simulate this with direct contract calls
    
    const contract = await getContractReadOnly();
    
    // Since we don't have an efficient way to get all listings in one call,
    // we'll loop through recent papers to check for listings
    const listedNFTs: NFTListing[] = [];
    
    // Get recent NFT listed events
    // This is a temporary approach - in production we'd use a subgraph query
    try {
      const { data } = await client.query({
        query: gql`
          query {
            nftListeds(first: 100, orderBy: timestamp, orderDirection: desc) {
              id
              tokenId
              price
              seller
              blockTimestamp
            }
          }
        `
      });
      
      if (data && data.nftListeds && data.nftListeds.length > 0) {
        // Process each listing
        for (const listing of data.nftListeds) {
          try {
            // Find which paper this NFT belongs to
            let paperId = 0;
            for (let i = 1; i <= 100; i++) { // Limited range for demo
              const tokenId = await contract.paperNFT(i);
              if (Number(tokenId) === Number(listing.tokenId)) {
                paperId = i;
                break;
              }
            }
            
            if (paperId > 0) {
              // Get paper details
              const [, title, author, status, versionCount, , , keywords, license] = 
                await contract.getPaperInfo(paperId);
                
              // Ensure it's still for sale by checking current price
              const currentPrice = await contract.nftSalePrice(listing.tokenId);
              
              if (Number(currentPrice) > 0) {
                // Get owner/seller
                const seller = await contract.ownerOf(listing.tokenId);
                
                // Get influence
                const influence = await contract.calculateInfluence(paperId);
                
                // Get latest version IPFS hash
                const [ipfsHash] = await contract.getVersion(paperId, Number(versionCount) - 1);
                
                listedNFTs.push({
                  paperId,
                  tokenId: Number(listing.tokenId),
                  title,
                  author,
                  seller,
                  price: ethers.formatEther(currentPrice),
                  ipfsHash,
                  influence: Number(influence)
                });
              }
            }
          } catch (err) {
            console.error(`Error processing NFT listing ${listing.tokenId}:`, err);
          }
        }
      }
    } catch (err) {
      console.error("Error querying NFT listings:", err);
      
      // Fallback to direct contract scanning if subgraph query fails
      for (let paperId = 1; paperId <= 100; paperId++) {
        try {
          const tokenId = await contract.paperNFT(paperId);
          if (Number(tokenId) > 0) {
            const price = await contract.nftSalePrice(tokenId);
            
            if (Number(price) > 0) {
              // NFT is listed for sale
              const [, title, author, status, versionCount] = await contract.getPaperInfo(paperId);
              const seller = await contract.ownerOf(tokenId);
              const influence = await contract.calculateInfluence(paperId);
              
              // Get IPFS hash from the latest version
              const [ipfsHash] = await contract.getVersion(paperId, Number(versionCount) - 1);
              
              listedNFTs.push({
                paperId,
                tokenId: Number(tokenId),
                title,
                author,
                seller,
                price: ethers.formatEther(price),
                ipfsHash,
                influence: Number(influence)
              });
            }
          }
        } catch (err) {
          // Skip errors for papers that don't exist
          console.log(`Skipping paper ${paperId} due to error:`, err);
        }
      }
    }
    
    return listedNFTs;
  } catch (error) {
    console.error("Error fetching listed NFTs:", error);
    return [];
  }
}

export async function searchNFTsByKeyword(keyword: string): Promise<NFTListing[]> {
  // Get all NFTs and filter by keyword
  const allNFTs = await getAllListedNFTs();
  
  if (!keyword) return allNFTs;
  
  const lowerKeyword = keyword.toLowerCase();
  
  return allNFTs.filter(nft => 
    nft.title.toLowerCase().includes(lowerKeyword) || 
    nft.author.toLowerCase().includes(lowerKeyword)
  );
}
