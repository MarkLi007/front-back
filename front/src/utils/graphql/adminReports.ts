
import { gql } from '@apollo/client';
import { client } from './client';
import { getContract, ReportType } from '../contract';

interface PaperReport {
  paperId: number;
  reportIndex: number;
  reportType: ReportType;
  reason: string;
  reporter: string;
  timestamp: number;
  processed: boolean;
  valid: boolean;
}

export async function getPaperReports(): Promise<PaperReport[]> {
  try {
    // This is a placeholder implementation that would need to be replaced with actual
    // subgraph query once you have reporting events indexed
    
    // For now, we'll use direct contract calls to simulate this functionality
    const contract = await getContract();
    const paperCount = await contract.paperCount();
    
    let reports: PaperReport[] = [];
    
    // Loop through papers to find reports
    // This is inefficient but works for demonstration
    for (let paperId = 1; paperId <= Number(paperCount); paperId++) {
      try {
        // Get paper info to check if it has reports
        const [, , , , , , reportCount] = await contract.getPaperInfo(paperId);
        
        if (reportCount > 0) {
          // For each report, get details
          for (let i = 0; i < Number(reportCount); i++) {
            try {
              // This would need to be replaced with actual contract call or query
              // Structure depends on your contract's actual storage and getter methods
              
              // Placeholder data - in a real implementation, you would get this from events or contract
              reports.push({
                paperId,
                reportIndex: i,
                reportType: ReportType.PLAGIARISM, // Updated from FRAUD to PLAGIARISM
                reason: "疑似抄袭已发表文献", // Placeholder
                reporter: "0x1234...5678", // Placeholder
                timestamp: Math.floor(Date.now() / 1000) - i * 3600, // Placeholder
                processed: false,
                valid: false,
              });
            } catch (reportError) {
              console.error(`Error fetching report ${i} for paper ${paperId}:`, reportError);
            }
          }
        }
      } catch (paperError) {
        console.error(`Error fetching paper info for paper ${paperId}:`, paperError);
      }
    }
    
    return reports;
  } catch (error) {
    console.error("Error getting reports:", error);
    return [];
  }
}

// This function would be used in a real implementation where your subgraph
// is indexing PaperReported events from your contract
export async function getPaperReportsFromSubgraph(): Promise<PaperReport[]> {
  try {
    const { data } = await client.query({
      query: gql`
        query {
          paperReporteds(orderBy: timestamp, orderDirection: desc) {
            id
            paperId
            reporter
            reportType
            reason
            timestamp
            processed
            valid
          }
          reportProcesseds {
            id
            paperId
            reportIndex
            valid
            processor
            blockTimestamp
          }
        }
      `
    });
    
    // Process data from subgraph to match our interface
    return [];
  } catch (error) {
    console.error("Error fetching reports from subgraph:", error);
    return [];
  }
}
