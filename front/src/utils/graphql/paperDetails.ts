
import { gql } from "@apollo/client";
import { client } from "./client";
import { getContractReadOnly } from '../contract';

// Query to get a specific paper by ID
export async function getPaperById(paperId: string) {
  try {
    // Get paper submission data
    const { data: paperData } = await client.query({
      query: gql`
        query {
          papers(where: { id: "${paperId}" }) {
            id
            title
            author
            abstract
            content
            citations
            influenceScore
          }
        }
      `,
    });
    if (!paperData.paperSubmitteds.length) {
      console.log("Paper not found in subgraph, trying contract...");
      
      // If not in subgraph, try contract
      const contract = await getContractReadOnly();
      const [owner, title, author, status, versionCount] = await contract.getPaperInfo(paperId);
      
      if (Number(status) >= 0) {
        // Get version info 
        const versions = [];
        for (let i = 0; i < Number(versionCount); i++) {
          const [ipfsHash, fileHash, timestamp, signature, references] = await contract.getVersion(paperId, i);
          versions.push({
            id: `${paperId}-${i}`,
            versionIndex: i,
            ipfsHash,
            timestamp: timestamp.toString(),
            signature,
            references
          });
        }
        
        return {
          id: paperId,
          owner,
          title,
          author,
          status: Number(status),
          timestamp: versions[0].timestamp,
          versions
        };
      }
      
      return null;
    }
    
    const paper = paperData.papers[0];
    
    return {
      ...paper,
      
      title: paper.title,
      author: paper.author,
      
    };
  } catch (error) {
    console.error("Error fetching paper by ID:", error);
    return null;
  }
}
